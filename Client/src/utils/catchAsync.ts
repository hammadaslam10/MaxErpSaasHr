export const catchAsync = <T, P>(
  fn: (payload: P) => Promise<T>,
  functionName: string
) => {
  return async (payload: P): Promise<T> => {
    try {
      return await fn(payload);
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      
      
      throw error;
    }
  };
};
