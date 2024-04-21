import type { IConfiguration } from '@onyx-gen/types'
import { Configuration } from './config'

class ConfigurationManager {
  private _config: Configuration | null = null

  public get config(): Configuration {
    if (!this._config)
      throw new Error('Configuration has not been loaded yet')
    return this._config
  }

  public async loadConfig(): Promise<Configuration> {
    const savedConfig: IConfiguration | undefined = await figma.clientStorage.getAsync('config')
    this._config = new Configuration(savedConfig)
    return this.config
  }

  public async updateConfig(newConfig: Partial<IConfiguration>): Promise<Configuration> {
    this._config = new Configuration(newConfig, this.config.config)
    await figma.clientStorage.setAsync('config', this.config.config)
    return this.config
  }
}

export default ConfigurationManager
