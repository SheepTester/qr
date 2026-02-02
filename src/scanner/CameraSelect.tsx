import * as Icon from 'react-feather'
import styles from './CameraSelect.module.css'

export type CameraSelectProps = {
  cameras: MediaDeviceInfo[]
  cameraId: string
  onCamera: (cameraId: string) => void
}
export function CameraSelect ({
  cameras,
  cameraId,
  onCamera
}: CameraSelectProps) {
  return (
    <div className={styles.selectCameraWrapper}>
      <Icon.Camera />
      <Icon.ChevronDown />
      <select
        className={styles.selectCamera}
        aria-label='Camera'
        value={cameraId}
        onChange={e => onCamera(e.currentTarget.value)}
      >
        <option value='user'>Front camera</option>
        <option value='environment'>Back camera</option>
        {cameras.map(({ deviceId, label }) => (
          <option key={deviceId} value={deviceId}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
