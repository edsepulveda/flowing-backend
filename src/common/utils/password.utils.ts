import * as argon2 from 'argon2';


const argon2Options = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 2,
  saltLength: 16,
  hashLength: 32,
};

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await argon2.hash(password, argon2Options)
  } catch (error) {
    throw new Error(`Error hashing password ${error.message}`)
  }
}


export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, plain);
  } catch (error) {
    throw new Error(`Error verifying password: ${error.message}`);
  }
};

export const needsRehash = async (hash: string): Promise<boolean> => {
  try {
    return argon2.needsRehash(hash, argon2Options);
  } catch (error) {
    throw new Error(`Error checking if password needs rehash: ${error.message}`);
  }
};