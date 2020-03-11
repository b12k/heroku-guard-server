import parseDomain from 'parse-domain';

export default (hostname: string): string => {
  let cookieDomain = hostname;
  const parsedHostname = parseDomain(hostname);
  if (parsedHostname) cookieDomain = `.${parsedHostname.domain}.${parsedHostname.tld}`;

  return cookieDomain;
};
