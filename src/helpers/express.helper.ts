import stoppable from 'stoppable';

let _server: stoppable.StoppableServer | undefined;

export const getServer = function (): stoppable.StoppableServer | undefined {
  return _server;
};

export const setServer = function (server: stoppable.StoppableServer): void {
  _server = server;
};
