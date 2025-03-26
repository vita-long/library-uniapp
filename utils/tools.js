function getHeader(data, name) {
  const headers = data.split(';');
  for (const header of headers) {
    const [key, value] = header.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export { getHeader }