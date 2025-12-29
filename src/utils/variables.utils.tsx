export const getEnvVar = (name: string) => {
  const value = import.meta.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not defined.`);
  }
  return value;
};