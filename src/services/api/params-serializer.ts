type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const toScalarString = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return null;
};

const toDateBetweenValue = (value: PlainObject): string | null => {
  const from = toScalarString(value.from);
  const to = toScalarString(value.to);

  if (!from && !to) {
    return null;
  }

  return [from, to].filter((part): part is string => Boolean(part)).join(',');
};

const appendArrayValue = (
  searchParams: URLSearchParams,
  key: string,
  value: unknown,
  useBracketSuffix: boolean
): void => {
  const targetKey = useBracketSuffix ? `${key}[]` : key;

  if (isPlainObject(value)) {
    searchParams.append(targetKey, JSON.stringify(value));
    return;
  }

  const scalar = toScalarString(value);
  if (scalar != null) {
    searchParams.append(targetKey, scalar);
  }
};

const appendNestedValue = (
  searchParams: URLSearchParams,
  parentKey: string,
  nestedKey: string,
  nestedValue: unknown
): void => {
  const key = `${parentKey}[${nestedKey}]`;

  if (Array.isArray(nestedValue)) {
    nestedValue.forEach((value) => {
      appendArrayValue(searchParams, key, value, true);
    });
    return;
  }

  if (isPlainObject(nestedValue)) {
    const dateBetween = nestedKey === 'date_between' ? toDateBetweenValue(nestedValue) : null;
    searchParams.append(key, dateBetween ?? JSON.stringify(nestedValue));
    return;
  }

  const scalar = toScalarString(nestedValue);
  if (scalar != null) {
    searchParams.append(key, scalar);
  }
};

const appendTopLevelValue = (searchParams: URLSearchParams, key: string, value: unknown): void => {
  if (value == null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendArrayValue(searchParams, key, item, false));
    return;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      appendNestedValue(searchParams, key, nestedKey, nestedValue);
    });
    return;
  }

  const scalar = toScalarString(value);
  if (scalar != null) {
    searchParams.append(key, scalar);
  }
};

export const serializeApiParams = (params: unknown): string => {
  if (params instanceof URLSearchParams) {
    return params.toString();
  }

  if (!isPlainObject(params)) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    appendTopLevelValue(searchParams, key, value);
  });

  return searchParams.toString();
};
