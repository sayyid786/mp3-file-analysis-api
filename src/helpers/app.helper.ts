let alreadyShutdown: boolean = false;

export const getAlreadyShutdown = function (): boolean {
  return alreadyShutdown;
};

export const setAlreadyShutdown = function (): void {
  alreadyShutdown = true;
};
