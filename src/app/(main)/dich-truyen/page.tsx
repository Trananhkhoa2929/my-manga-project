import { Metadata } from 'next'
import { TranslatorTool } from '@/components/features/translator'

export const metadata: Metadata = {
    title: 'Dịch Truyện - Manga Translator | AI OCR Translation',
    description: 'Công cụ dịch manga tự động từ tiếng Nhật, Hàn, Trung sang tiếng Việt với công nghệ OCR và AI. Phát hiện text bubble, dịch và thay thế văn bản một cách thông minh.',
    keywords: ['manga translator', 'dịch truyện', 'OCR', 'dịch manga', 'tiếng Nhật', 'tiếng Việt'],
}

export default function DichTruyenPage() {
    return (
        <main className="container mx-auto px-4">
            <TranslatorTool />
        </main>
    )
}
