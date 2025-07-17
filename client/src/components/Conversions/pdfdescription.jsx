import { useState, useRef } from "react";
import { FaPaperPlane, FaFilePdf } from "react-icons/fa";
import { Button } from '../button';
import axios from 'axios';
// import gradient from 'random-gradient';

export default function PDFChatInterface() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedText, setExtractedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const fileInputRef = useRef();

    // Handle file selection
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessages([
                ...messages,
                { type: "system", text: "Uploading PDF..." }
            ]);
            setLoading(true);

            // Upload file to backend
            const formData = new FormData();
            formData.append("pdf", file);

            try {
                const response = await axios.post("http://localhost:3001/des/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                setExtractedText(response.data.text || "No text extracted.");
                setMessages(msgs => [
                    ...msgs,
                    { type: "system", text: "PDF uploaded and text extracted." }
                ]);
            } catch (error) {
                setMessages(msgs => [
                    ...msgs,
                    { type: "system", text: "Failed to upload or extract PDF." }
                ]);
            }
            setLoading(false);
        }
    };

    // Handle sending a prompt/message and PDF upload
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedFile) return;

        // If PDF is selected and not yet extracted, extract on first send
        if (selectedFile && !extractedText) {
            setLoading(true);
            // Simulate extraction (replace with real API call)
            setTimeout(() => {
                setExtractedText("Sample extracted text from PDF...");
                setMessages([
                    ...messages,
                    { type: "system", text: "PDF uploaded and text extracted." },
                    ...(input.trim() ? [{ type: "user", text: input }] : [])
                ]);
                if (input.trim()) {
                    setTimeout(() => {
                        setMessages(msgs => [
                            ...msgs,
                            { type: "bot", text: "Sample response to: " + input }
                        ]);
                    }, 1000);
                }
                setInput("");
                setLoading(false);
            }, 2000);
            return;
        }

        if (input.trim()) {
            setMessages([...messages, { type: "user", text: input }]);
            // Simulate response (replace with real API call)
            setTimeout(() => {
                setMessages(msgs => [
                    ...msgs,
                    { type: "bot", text: "Sample response to: " + input }
                ]);
            }, 1000);
            setInput("");
        }
    };

    // Handle clicking the PDF icon to trigger file input
    const handlePdfIconClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="h-screen w-screen bg-gray-900 flex flex-col justify-between items-center p-0 text-white">
            {/* Chat area */}
            <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-end pt-8 pb-32 px-2">
                <div className="flex flex-col gap-3 overflow-y-auto h-full">
                                        {loading && (
                                            <div className="text-[10px] text-gray-400 italic">Processing...</div>
                                        )}
                                        {!loading && extractedText && (
                                            <div className="text-[10px] text-gray-500 italic">Processed</div>
                                        )}
                                        {messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={
                                                    (msg.type === "user"
                                                        ? "self-end bg-gray-800 rounded-lg px-4 py-2 max-w-xs"
                                                        : msg.type === "bot"
                                                        ? "self-start bg-gray-800 rounded-lg px-4 py-2 max-w-xs"
                                                        : "self-center text-[10px] text-gray-400"
                                                    ) + " text-[13px]"
                                                }
                                            >
                                                {msg.text}
                                            </div>
                                        ))}
                                    </div>
                </div>
                        
            <form
                onSubmit={handleSend}
                className="fixed bottom-0 left-0 w-full flex flex-col items-center bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent py-6 px-2 border-t border-gray-800"
                style={{ zIndex: 10 }}
            >
                <div className="w-full max-w-2xl mb-1">
                    {selectedFile && (
                        <div className="flex items-center gap-2 text-blue-400 text-xs mb-1">
                            <FaFilePdf size={16} />
                            <span className="truncate">{selectedFile.name}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-end w-full max-w-2xl gap-2">
                    <button
                        type="button"
                        onClick={handlePdfIconClick}
                        className="bg-gray-800 hover:bg-blue-700 text-blue-400 rounded-lg p-3 flex items-center justify-center"
                        title="Attach PDF"
                    >
                        <FaFilePdf size={12} />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf, .docx"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </button>
                    <textarea
                        className="flex-1 min-h-[48px] max-h-40 p-3 bg-gray-800 text-gray-200 rounded-lg focus:outline-none resize-y"
                        placeholder="Type your message or prompt... (Shift+Enter for new line)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                        rows={1}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center gap-2"
                        disabled={loading || (!input.trim() && !selectedFile)}
                        title="Send"
                    >
                        <FaPaperPlane />
                    </Button>
                </div>
            </form>
        </div>
    );
}