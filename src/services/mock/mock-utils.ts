export const delay = async (time = 500): Promise<void> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, time);
  });
};
