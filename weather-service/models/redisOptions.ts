export default interface RedisOptions {
  socket: { host: string; port: number };
  password?: string;
}