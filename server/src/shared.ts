export const LOCAL_ADDRESSES = [
  '0.0.0.0',
  '127.0.0.1',
  '::ffff:127.0.0.1',
  '::1'
];

export const isLocal = (address?: string): boolean => {
  return address ? LOCAL_ADDRESSES.indexOf (address) !== -1 : false;
};

