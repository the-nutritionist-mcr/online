/**
 * Get an environment variable or throw an error if it is not set
 *
 * @param name - the name of the environment variable
 */
export const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`process.env.${name} was not configured`);
  }

  return value;
};
