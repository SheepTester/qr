import { QRCodeErrorCorrectionLevel } from 'qrcode'
import { useId } from 'react'
import common from '../common.module.css'
import styles from './GenerateOptions.module.css'

type Ecl = {
  letter: QRCodeErrorCorrectionLevel
  name: string
  percent: number
}
const ecls: Ecl[] = [
  { letter: 'L', name: 'Low', percent: 7 },
  { letter: 'M', name: 'Medium', percent: 15 },
  { letter: 'Q', name: 'Quartile', percent: 25 },
  { letter: 'H', name: 'High', percent: 30 }
]

export type GenerateOptionsProps = {
  ecl: QRCodeErrorCorrectionLevel
  onEcl: (ecl: QRCodeErrorCorrectionLevel) => void
  pixelSize: string
  onPixelSize: (pixelSize: string) => void
}
export function GenerateOptions ({
  ecl,
  onEcl,
  pixelSize,
  onPixelSize
}: GenerateOptionsProps) {
  const id = useId()
  return (
    <>
      <div
        role='radiogroup'
        className={styles.labelWrapper}
        aria-labelledby={`${id}-ecl`}
      >
        <div className={styles.label} id={`${id}-ecl`}>
          Error resistance
        </div>
        <div className={styles.buttonGroup}>
          {ecls.map(({ letter, name, percent }) => (
            <label
              className={`${styles.ecl} ${
                ecl === letter ? styles.eclSelected : ''
              }`}
              key={letter}
            >
              <input
                className={common.visuallyHidden}
                type='radio'
                name='ecl'
                value={letter}
                checked={ecl === letter}
                onChange={e => e.currentTarget.checked && onEcl(letter)}
              />
              <span className={styles.eclLetter}>{letter}</span>
              <span className={styles.eclName}>{name}</span>
              <span className={styles.eclPercent}>{percent}%</span>
            </label>
          ))}
        </div>
      </div>
      <label className={styles.labelWrapper}>
        <span className={styles.label}>Export pixel size</span>
        <input
          type='number'
          name='pixel-size'
          className={styles.input}
          value={pixelSize}
          onChange={e => onPixelSize(e.currentTarget.value)}
        />
      </label>
    </>
  )
}
