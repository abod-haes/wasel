import { getActiveApiBaseUrl } from '@/config/api-environment';
import { normalizeCountryCallingCode, normalizeNationalPhoneNumber } from '@/constants/phone';

export interface WebAccountDeletionCredentials {
  countryCallingCode: string;
  phoneNumber: string;
  password: string;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return undefined;
  return response.json().catch(() => undefined);
}

function failedResponse(body: unknown): boolean {
  return Boolean(
    body &&
      typeof body === 'object' &&
      'success' in body &&
      (body as { success: unknown }).success === false
  );
}

/**
 * Account deletion from the public web page without persisting credentials or tokens.
 * Requires server CORS to allow the deployed public site domain.
 */
export async function deleteAccountViaWeb(input: WebAccountDeletionCredentials): Promise<void> {
  const apiBase = getActiveApiBaseUrl();
  if (!apiBase.startsWith('https://')) {
    throw new Error('تعذر فتح اتصال آمن بالسيرفر. حاول مرة ثانية لاحقاً.');
  }

  let auth: Response;
  try {
    auth = await fetch(`${apiBase}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        countryCallingCode: normalizeCountryCallingCode(input.countryCallingCode),
        phoneNumber: normalizeNationalPhoneNumber(input.phoneNumber),
        password: input.password,
      }),
      credentials: 'omit',
      cache: 'no-store',
    });
  } catch {
    throw new Error('تعذر الوصول للسيرفر. تأكد من الاتصال أو من إعداد نطاق الموقع لدى الدعم.');
  }

  const loginBody: unknown = await parseResponseBody(auth);
  if (!auth.ok || failedResponse(loginBody)) {
    throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة، أو الحساب غير متاح.');
  }

  const token =
    loginBody && typeof loginBody === 'object' && ('token' in loginBody || 'Token' in loginBody)
      ? ((loginBody as { token?: unknown; Token?: unknown }).token ?? (loginBody as { Token?: unknown }).Token)
      : undefined;
  if (typeof token !== 'string' || !token) {
    throw new Error('تعذر التحقق من الحساب. حاول مرة ثانية أو تواصل مع الدعم.');
  }

  let response: Response;
  try {
    response = await fetch(`${apiBase}/api/Users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      credentials: 'omit',
      cache: 'no-store',
    });
  } catch {
    // The request could have reached the server even if the response was lost.
    throw new Error('انقطع الاتصال خلال الحذف. لا تعيد الطلب فوراً؛ تحقّق من حسابك أو تواصل مع الدعم.');
  }

  const deletionBody = await parseResponseBody(response);
  if (!response.ok || failedResponse(deletionBody)) {
    throw new Error('السيرفر لم يؤكد حذف الحساب. تواصل مع الدعم إذا استمرت المشكلة.');
  }
}
