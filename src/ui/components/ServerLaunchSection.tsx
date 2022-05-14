import React from 'react'
import Checkbox from './common/Checkbox'
import BigButton from './common/BigButton'
import { getConfig, saveConfig, setConfigOption } from '../../utils/configuration'
import { translate } from '../../utils/language'
import { invoke } from '@tauri-apps/api/tauri'

import Server from '../../resources/icons/server.svg'
import './ServerLaunchSection.css'
import TextInput from './common/TextInput'

interface IProps {
  [key: string]: any
}

interface IState {
  grasscutterEnabled: boolean;
  buttonLabel: string;
  checkboxLabel: string;
  ip: string;
  port: string;

  ipPlaceholder: string;
  portPlaceholder: string;
}

export default class ServerLaunchSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      grasscutterEnabled: false,
      buttonLabel: '',
      checkboxLabel: '',
      ip: '',
      port: '',
      ipPlaceholder: '',
      portPlaceholder: ''
    }

    this.toggleGrasscutter = this.toggleGrasscutter.bind(this)
    this.playGame = this.playGame.bind(this)
    this.setIp = this.setIp.bind(this)
    this.setPort = this.setPort.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      grasscutterEnabled: config.toggle_grasscutter,
      buttonLabel: await translate('main.launch_button'),
      checkboxLabel: await translate('main.gc_enable'),
      ip: config.last_ip || '',
      port: config.last_port || '',
      ipPlaceholder: await translate('main.ip_placeholder'),
      portPlaceholder: await translate('main.port_placeholder')
    })
  }

  async toggleGrasscutter() {
    const config = await getConfig()

    config.toggle_grasscutter = !config.toggle_grasscutter

    // Set state as well
    this.setState({
      grasscutterEnabled: config.toggle_grasscutter
    })

    await saveConfig(config)
  }

  async playGame() {
    const config = await getConfig()
  
    if (!config.game_path) return
    
    // Connect to proxy
    if (config.toggle_grasscutter) {
      // Save last connected server and port
      await setConfigOption('last_ip', this.state.ip)
      await setConfigOption('last_port', this.state.port)

      // Connect to proxy
      await invoke('connect', { port: 8365 })
    }
  
    // Launch the program
    await invoke('run_program', { path: config.game_path })
  }

  async launchServer() {
    const config = await getConfig()

    if (!config.grasscutter_path) return

    let jarFolder = config.grasscutter_path

    if (jarFolder.includes('/')) {
      jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('/'))
    } else {
      jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('\\'))
    }

    // Launch the jar
    await invoke('run_jar', {
      path: config.grasscutter_path,
      executeIn: jarFolder
    })
  }

  setIp(text: string) {
    this.setState({
      ip: text
    })
  }

  setPort(text: string) {
    this.setState({
      port: text
    })
  }

  render() {
    return (
      <div id="playButton">
        <div id="serverControls">
          <Checkbox id="enableGC" label={this.state.checkboxLabel} onChange={this.toggleGrasscutter} checked={this.state.grasscutterEnabled}/>
        </div>

        <div className="ServerConfig">
          <TextInput id="ip" key="ip" placeholder={this.state.ipPlaceholder} onChange={this.setIp} />,
          <TextInput id="port" key="port" placeholder={this.state.portPlaceholder} onChange={this.setPort}/> 
        </div>

        <div className="ServerLaunchButtons">
          <BigButton onClick={this.playGame} id="officialPlay">{this.state.buttonLabel}</BigButton>
          <BigButton onClick={this.launchServer} id="serverLaunch">
            <img className="ServerIcon" src={Server} />
          </BigButton>
        </div>

      </div>
    )
  }
}