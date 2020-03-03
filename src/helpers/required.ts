export default (name: string) => {
  throw new SyntaxError(`Variable ${name} is required`);
};
