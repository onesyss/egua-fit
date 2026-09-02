import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export function evolutionPdfFilename(studentName: string, monthLabel: string): string {
  const safe = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
  return `Egua-Fit-Evolucao-${safe(studentName)}-${safe(monthLabel)}.pdf`
}

function waitFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

async function captureEvolutionSheet(): Promise<HTMLCanvasElement> {
  const sheet = document.querySelector(
    '#evolucao-mensal .evolucao-print-sheet',
  ) as HTMLElement | null
  if (!sheet) {
    throw new Error('Relatório de evolução não encontrado na tela.')
  }

  document.body.classList.add('evolucao-pdf-capture')
  try {
    await waitFrame()
    await new Promise((resolve) => window.setTimeout(resolve, 400))
    return await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: Math.max(sheet.scrollWidth, 900),
    })
  } finally {
    document.body.classList.remove('evolucao-pdf-capture')
  }
}

function canvasToPdfBlob(canvas: HTMLCanvasElement): Blob {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2
  const imgWidth = usableWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  let heightLeft = imgHeight
  let position = margin

  pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
  heightLeft -= usableHeight

  while (heightLeft > 0) {
    position = margin - (imgHeight - heightLeft)
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
    heightLeft -= usableHeight
  }

  return pdf.output('blob')
}

export async function generateEvolutionPdfBlob(): Promise<Blob> {
  const canvas = await captureEvolutionSheet()
  return canvasToPdfBlob(canvas)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export async function trySharePdfFile(
  blob: Blob,
  filename: string,
  text: string,
): Promise<boolean> {
  const file = new File([blob], filename, { type: 'application/pdf' })
  const payload = {
    files: [file],
    title: 'Égua Fit — Evolução mensal',
    text,
  }

  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false
  }
  if (navigator.canShare && !navigator.canShare(payload)) {
    return false
  }

  try {
    await navigator.share(payload)
    return true
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return true
    }
    return false
  }
}
