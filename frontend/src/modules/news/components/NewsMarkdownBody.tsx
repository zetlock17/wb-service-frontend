import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NewsMarkdownBodyProps {
  content: string;
}

const NewsMarkdownBody = ({ content }: NewsMarkdownBodyProps) => (
  <div className="max-w-none text-gray-700 leading-relaxed">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
        h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 mb-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm text-gray-800">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="mb-4 p-3 bg-gray-100 rounded-lg overflow-x-auto text-sm">{children}</pre>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-700 hover:underline">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="mb-4 overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 px-3 py-2 bg-gray-50 text-left font-medium text-gray-700">{children}</th>
        ),
        td: ({ children }) => <td className="border border-gray-300 px-3 py-2">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default NewsMarkdownBody;
