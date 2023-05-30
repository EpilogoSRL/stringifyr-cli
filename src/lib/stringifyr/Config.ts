const Config = {
  fileSlug: 'default',
  baseURL: 'https://us-central1-stringifyr-develop.cloudfunctions.net/publicApi',
}

const ConfigDev: typeof Config = {
  fileSlug: 'default',
  baseURL: 'https://us-central1-stringifyr-develop.cloudfunctions.net/publicApi',
}

export function getConfig<K extends keyof typeof Config>(isDev = false, key: K): typeof Config[K] {
  return isDev ? ConfigDev[key] : Config[key];
}
