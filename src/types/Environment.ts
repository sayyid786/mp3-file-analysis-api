export type Environment = {
  nodeEnv: string;
  logLevel: string;
  server: {
    port: number;
    secureCookies: boolean;
    url: string;
  };
};
