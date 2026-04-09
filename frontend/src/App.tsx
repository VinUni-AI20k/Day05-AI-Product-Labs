import { useEffect, useRef } from 'react'
import { Mic, Redo2, Save, Stethoscope, Undo2, XCircle } from 'lucide-react'
import { Badge } from './components/ui/Badge'
import { Button } from './components/ui/Button'
import { Modal } from './components/ui/Modal'
import { Skeleton } from './components/ui/Skeleton'
import { Toast } from './components/ui/Toast'
import { useClinicalScribe } from './context/ClinicalScribeContext'

function App() {
  const {
    showToast,
    showModal,
    isRecording,
    isProcessing,
    showSoap,
    transcriptTurns,
    soapDraft,
    recordingTime,
    canUndo,
    canRedo,
    setShowToast,
    setShowModal,
    handleStartRecording,
    handleStopAndProcess,
    updateSoapField,
    handleCancelCase,
    undoSoap,
    redoSoap,
  } = useClinicalScribe()

  const transcriptRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!transcriptRef.current) return
    transcriptRef.current.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [transcriptTurns])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const hasCtrlOrCmd = event.ctrlKey || event.metaKey

      if (!hasCtrlOrCmd) return

      const key = event.key.toLowerCase()

      if (key === 's') {
        event.preventDefault()
        if (!showSoap || isProcessing) return
        setShowToast(true)
      }

      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          redoSoap()
        } else {
          undoSoap()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isProcessing, redoSoap, setShowToast, showSoap, undoSoap])

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-vinmec-primary px-5 py-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white font-bold text-vinmec-alert">
              V
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-wide">Vinmec HIS | Clinical Scribe AI</h1>
              <p className="text-sm text-blue-200">BN: Nguyễn Văn A (ID: BN-2026-00001) • Chuyên khoa Nội</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="ai" className="bg-blue-700 text-white">
              Stage 3 Layout
            </Badge>
            <div className="flex items-center gap-2 rounded-lg bg-blue-800/80 px-3 py-2 text-sm text-blue-50">
              <Stethoscope size={16} />
              <span>BS. Lê Huy Hồng Nhật • Phòng 401</span>
            </div>
          </div>
        </header>

        <main className="grid min-h-[65vh] grid-cols-1 gap-4 md:grid-cols-[3fr_7fr]">
          <section className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Live Transcript</h2>
              <span className="text-xs text-gray-500">{recordingTime}</span>
            </div>

            <div ref={transcriptRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
              {transcriptTurns.length === 0 ? (
                <div className="flex h-full min-h-32 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
                  Bấm “Ghi âm” để bắt đầu hội thoại
                </div>
              ) : null}

              {transcriptTurns.map((turn, index) => (
                <p
                  key={`${turn.speaker}-${index}`}
                  className={`rounded-lg p-3 text-gray-800 ${
                    turn.speaker === 'doctor' ? 'bg-gray-100' : 'bg-blue-50'
                  }`}
                >
                  <span className="font-semibold">{turn.speaker === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}:</span>{' '}
                  {turn.text}
                </p>
              ))}

              {isRecording ? (
                <p className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  <span className="blink-dot inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                  Đang ghi âm...
                </p>
              ) : null}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              {isRecording ? (
                <Button variant="danger" iconLeft={<Mic size={16} />} onClick={handleStopAndProcess} className="w-full">
                  Kết thúc & Trích xuất
                </Button>
              ) : (
                <Button variant="secondary" iconLeft={<Mic size={16} />} onClick={handleStartRecording} className="w-full">
                  Ghi âm
                </Button>
              )}
            </div>
          </section>

          <section className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700">SOAP Draft</h2>
              <Badge variant="ai">{showSoap ? 'AI Generated' : 'Chờ xử lý AI'}</Badge>
            </div>

            <div className="grid flex-1 gap-4 p-4 md:grid-cols-2">
              {isProcessing ? (
                <article className="rounded-lg border border-gray-200 bg-white p-4 md:col-span-2">
                  <p className="mb-3 text-sm font-medium text-gray-700">AI đang tổng hợp SOAP...</p>
                  <Skeleton lines={5} />
                </article>
              ) : null}

              {!isProcessing && !showSoap ? (
                <article className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500 md:col-span-2">
                  Chưa có kết quả SOAP. Hãy ghi âm và bấm “Kết thúc & Trích xuất”.
                </article>
              ) : null}

              {!isProcessing && showSoap ? (
                <>
                  <article className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-1">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">S - Subjective</h3>
                    <p
                      className="min-h-20 whitespace-pre-line rounded border border-transparent bg-white/70 p-2 text-sm text-gray-600 focus:border-blue-300 focus:outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSoapField('subjective', e.currentTarget.textContent ?? '')}
                    >
                      {soapDraft.subjective}
                    </p>
                  </article>

                  <article className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-1">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">O - Objective</h3>
                    <p
                      className="min-h-20 whitespace-pre-line rounded border border-transparent bg-white/70 p-2 text-sm text-gray-600 focus:border-blue-300 focus:outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSoapField('objective', e.currentTarget.textContent ?? '')}
                    >
                      {soapDraft.objective}
                    </p>
                  </article>

                  <article className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-2">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">A - Assessment</h3>
                    <p
                      className="min-h-16 whitespace-pre-line rounded border border-transparent bg-white/70 p-2 text-sm font-medium text-red-600 focus:border-blue-300 focus:outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSoapField('assessment', e.currentTarget.textContent ?? '')}
                    >
                      {soapDraft.assessment}
                    </p>
                  </article>

                  <article className="rounded-lg border border-blue-100 bg-blue-50 p-3 md:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-blue-800">P - Plan</h3>
                      <Badge variant="warning">Cần review</Badge>
                    </div>
                    <p
                      className="min-h-16 whitespace-pre-line rounded border border-transparent bg-white/70 p-2 text-sm text-gray-700 focus:border-blue-300 focus:outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSoapField('plan', e.currentTarget.textContent ?? '')}
                    >
                      {soapDraft.plan}{' '}
                    </p>
                  </article>
                </>
              ) : null}
            </div>
          </section>
        </main>

        <footer className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Button
            variant="secondary"
            iconLeft={<Undo2 size={16} />}
            onClick={undoSoap}
            disabled={!showSoap || isProcessing || !canUndo}
            title="Undo (Ctrl/Cmd + Z)"
          >
            Undo
          </Button>
          <Button
            variant="secondary"
            iconLeft={<Redo2 size={16} />}
            onClick={redoSoap}
            disabled={!showSoap || isProcessing || !canRedo}
            title="Redo (Ctrl/Cmd + Shift + Z)"
          >
            Redo
          </Button>
          <Button variant="ghost" iconLeft={<XCircle size={16} />} onClick={() => setShowModal(true)}>
            Hủy / Ca mới
          </Button>
          <Button
            iconLeft={<Save size={16} />}
            onClick={() => setShowToast(true)}
            disabled={!showSoap || isProcessing}
            title="Lưu bệnh án (Ctrl/Cmd + S)"
          >
            Lưu bệnh án
          </Button>
        </footer>
      </div>

      <Modal
        open={showModal}
        title="Xác nhận huỷ bản nháp SOAP?"
        description="Thao tác này sẽ xoá transcript và bản nháp SOAP hiện tại."
        confirmText="Xác nhận"
        cancelText="Quay lại"
        onCancel={() => setShowModal(false)}
        onConfirm={handleCancelCase}
      />

      <Toast
        open={showToast}
        message="Đã lưu bệnh án thành công"
        duration={5000}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}

export default App
