import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownMessage({ message }) {
    return (
        <>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ href, children, ...props }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1">{children}</ol>
                    ),
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-bold mb-2 mt-3 first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h3>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-semibold text-sm text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            {children}
                        </td>
                    )
                }}
            >
                {message}
            </ReactMarkdown>
        </>
    )
}