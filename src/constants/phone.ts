export const DEFAULT_COUNTRY_CALLING_CODE = '+963';

export const PHONE_COUNTRY_CODES = [
  { value: '+963', label: '🇸🇾 +963' },
  { value: '+965', label: '🇰🇼 +965' },
  { value: '+966', label: '🇸🇦 +966' },
  { value: '+971', label: '🇦🇪 +971' },
  { value: '+974', label: '🇶🇦 +974' },
  { value: '+973', label: '🇧🇭 +973' },
  { value: '+968', label: '🇴🇲 +968' },
  { value: '+964', label: '🇮🇶 +964' },
  { value: '+961', label: '🇱🇧 +961' },
  { value: '+962', label: '🇯🇴 +962' },
  { value: '+90', label: '🇹🇷 +90' },
] as const;

export const normalizeCountryCallingCode = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits ? `+${digits}` : DEFAULT_COUNTRY_CALLING_CODE;
};

export const normalizeNationalPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '').replace(/^0+/, '');
};

export const formatFullPhoneNumber = (
  countryCallingCode?: string,
  phoneNumber?: string
): string => {
  const code = countryCallingCode?.trim() ?? '';
  const number = phoneNumber?.trim() ?? '';

  if (!code) {
    return number;
  }

  if (!number) {
    return code;
  }

  return `${code}${number}`;
};
