import { FC, useRef, useState, DragEvent } from 'react';
import styles from './App.module.scss';
import { useHorizontalScroll } from "./useHorizontalScroll.ts";

interface FileDropzoneProps {
  onChange?: (files: File[]) => void
  previewImages?: IPreview[]
  onRemovePreview?: (file: IPreview) => void
}

interface IPreview {
  id?: string
  name: string
  src: string
}

export const App: FC<FileDropzoneProps> = ({ onChange, previewImages, onRemovePreview }) => {
  const scrollRef = useHorizontalScroll<HTMLDivElement>()

  const inputRef = useRef<HTMLInputElement>(null)
  const [previewFiles, setPreviewFiles] = useState<IPreview[]>(previewImages || [])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uniqNames, setUniqNames] = useState<string[]>([])
  const [isDragActive, setIsDragActive] = useState<boolean>(false)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave' || e.type === 'dragend') {
      setIsDragActive(false)
    } else if (e.type === 'drop') {
      setIsDragActive(false)
      handleChange(e.dataTransfer!.files)
    }
  }

  const handleChange = (files: FileList | null) => {
    if (!files) return
    const _uniqNames: string[] = []
    const _selectedFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)

      if (!file) continue

      const uniqName = `${file.name}/${file.size}`

      if (!uniqNames.includes(uniqName)) {
        _uniqNames.push(uniqName)
        _selectedFiles.push(file)

        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onloadend = e => {
          setPreviewFiles(prev =>
            prev.concat([
              {
                name: file.name,
                src: e.target?.result as string
              }
            ])
          )
        }
      }
    }

    onChange?.(selectedFiles.concat(_selectedFiles))

    setSelectedFiles(prev => prev.concat(_selectedFiles))
    setUniqNames(prev => prev.concat(_uniqNames))
  }

  const handleRemove = (index: number) => {
    const file = selectedFiles[index]
    const preview = previewFiles[index]
    const _selectedFiles = selectedFiles.filter((_, i) => i !== index)

    onChange?.(_selectedFiles)
    onRemovePreview?.(preview)

    setUniqNames(prev => prev.filter(name => name !== `${file.name}/${file.size}`))
    setSelectedFiles(_selectedFiles)
    setPreviewFiles(prev => prev.filter((_, i) => i !== index))

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={styles.root}>
      <div
        className={`${styles.dropzone} ${isDragActive ? styles.dropzone__active : ''}`}
        onDragEnd={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrag}
      >
				<span className={styles.dropzone_title}>
					{isDragActive ? 'Положите файлы сюда' : 'Перетащите сюда изображения или нажмите кнопку выбрать'}
				</span>
        <button className={styles.dropzone_button} onClick={() => inputRef.current?.click()}>
          Выбрать
        </button>
      </div>

      <div className={styles.preview} ref={scrollRef}>
        {previewFiles.map((preview, i) => (
          <div key={preview.src} className={styles.preview_item}>
            <img decoding='auto' width={100} height={80} src={preview.src} alt={`preview-${i}`} />
            <button className={styles.preview_remove} onClick={() => handleRemove(i)}>
              x
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        className={styles.input}
        type='file'
        multiple
        onChange={e => handleChange(e.target.files)}
        accept='image/jpeg, image/webp'
      />
    </div>
  )
}

export default App
