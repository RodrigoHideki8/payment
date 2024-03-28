export type QueueProps = {
  name: Required<Readonly<string>>;
  endpoint?: Readonly<string>;
  isDurable?: Readonly<boolean>;
  recordsMustBeExpiresAt?: Readonly<number>;
};
