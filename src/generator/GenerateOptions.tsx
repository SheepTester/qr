import { QRCodeErrorCorrectionLevel, QRCodeMaskPattern } from 'qrcode'
import { useId } from 'react'
import common from '../common.module.css'
import styles from './GenerateOptions.module.css'
import { mask, PREVIEW_SIZE } from './mask'

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

const maskPatterns = [
  mask(0, (i, j) => (i + j) % 2),
  mask(1, (i, _) => i % 2),
  mask(2, (_, j) => j % 3),
  mask(3, (i, j) => (i + j) % 3),
  mask(4, (i, j) => (((i / 2) | 0) + ((j / 3) | 0)) % 2),
  mask(5, (i, j) => ((i * j) % 2) + ((i * j) % 3)),
  mask(6, (i, j) => (((i * j) % 3) + i * j) % 2),
  mask(7, (i, j) => (((i * j) % 3) + i + j) % 2)
]

export type GenerateOptionsProps = {
  ecl: QRCodeErrorCorrectionLevel
  onEcl: (ecl: QRCodeErrorCorrectionLevel) => void
  actualMask?: QRCodeMaskPattern
  mask: QRCodeMaskPattern | null
  onMask: (ecl: QRCodeMaskPattern | null) => void
  pixelSize: string
  onPixelSize: (pixelSize: string) => void
  opaque: boolean
  onOpaque: (opaque: boolean) => void
  margin: boolean
  onMargin: (margin: boolean) => void
}
export function GenerateOptions ({
  ecl,
  onEcl,
  actualMask,
  mask,
  onMask,
  pixelSize,
  onPixelSize,
  opaque,
  onOpaque,
  margin,
  onMargin
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
        <div className={`${styles.buttonGroup} ${styles.eclButtonGroup}`}>
          {ecls.map(({ letter, name, percent }) => (
            <label
              className={`${styles.option} ${styles.ecl} ${
                ecl === letter ? styles.selected : ''
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
      <div
        role='radiogroup'
        className={styles.labelWrapper}
        aria-labelledby={`${id}-mask`}
      >
        <div className={styles.label} id={`${id}-mask`}>
          Mask pattern
        </div>
        <div className={`${styles.buttonGroup} ${styles.maskButtonGroup}`}>
          <label
            className={`${styles.option} ${styles.maskOption} ${
              styles.maskAuto
            } ${mask === null ? styles.selected : ''}`}
          >
            <input
              className={common.visuallyHidden}
              type='radio'
              name='mask'
              value='auto'
              checked={mask === null}
              onChange={e => e.currentTarget.checked && onMask(null)}
            />
            Auto
          </label>
          {maskPatterns.map(({ value, path }) => (
            <label
              className={`${styles.option} ${styles.maskOption} ${
                mask === value ? styles.selected : ''
              }`}
              key={value}
            >
              <input
                className={common.visuallyHidden}
                type='radio'
                name='mask'
                value={value}
                checked={mask === value}
                onChange={e => e.currentTarget.checked && onMask(value)}
              />
              <svg
                className={styles.mask}
                viewBox={`0 -0.5 ${PREVIEW_SIZE} ${PREVIEW_SIZE}`}
                aria-label={`Mask ${value.toString(2).padStart(3, '0')}`}
              >
                <path d={path} />
              </svg>
              {mask === null && actualMask === value ? (
                <span className={styles.inUse} aria-label='(in use)' />
              ) : null}
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
      <label className={styles.checkboxWrapper}>
        <input
          type='checkbox'
          name='opaque'
          className='hidden-accessible'
          checked={opaque}
          onChange={e => onOpaque(e.currentTarget.checked)}
        />
        <span
          className={`${styles.checkbox} ${
            opaque ? styles.checkboxChecked : ''
          }`}
        />
        <span>Include white background</span>
      </label>
      <label className={styles.checkboxWrapper}>
        <input
          type='checkbox'
          name='margin'
          className='hidden-accessible'
          checked={margin}
          onChange={e => onMargin(e.currentTarget.checked)}
        />
        <span
          className={`${styles.checkbox} ${
            margin ? styles.checkboxChecked : ''
          }`}
        />
        <span>Include space around QR code</span>
      </label>
    </>
  )
}
