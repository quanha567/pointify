import { useState, useMemo, type ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import { ChevronDown, Copy, Check, FileQuestion, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { preprocessJiraMarkdown } from '../../utils/jira-markdown-parser';

interface StoryDescriptionViewProps {
  description?: string | null;
}

export function StoryDescriptionView({ description }: StoryDescriptionViewProps) {
  const { t } = useTranslation('room');
  const [copied, setCopied] = useState(false);

  const cleanDescription = useMemo(() => description?.trim() || '', [description]);

  const handleCopy = async () => {
    if (!cleanDescription) return;
    try {
      await navigator.clipboard.writeText(cleanDescription);
      setCopied(true);
      toast.success(t('room.codeCopied', 'Đã sao chép vào bộ nhớ tạm!'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy description');
    }
  };

  const markdownContent = useMemo(() => {
    return preprocessJiraMarkdown(cleanDescription);
  }, [cleanDescription]);

  return (
    <div className="space-y-3 pt-1">
      {/* Jira-style Collapsible Header with ADR 0035 Small Button (h-8) */}
      <div className="flex items-center justify-between gap-3 text-foreground pb-1">
        <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground select-none">
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          <span>{t('jira.descriptionTitle', 'Description')}</span>
        </div>

        {cleanDescription && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-md cursor-pointer transition-colors"
            title={t('jira.copyDescription', 'Sao chép mô tả')}
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                  {t('jira.copied', 'Đã chép')}
                </span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span className="text-[11px] font-medium font-mono">
                  {t('jira.copy', 'Sao chép')}
                </span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Description Content rendered via ReactMarkdown with ONE Brand Guidelines */}
      {!cleanDescription ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 select-none rounded-lg border border-dashed border-border p-6 bg-muted/20">
          <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <FileQuestion className="size-4" />
          </div>
          <p className="text-sm font-medium text-foreground">{t('jira.noDescription')}</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {t(
              'jira.noDescriptionHint',
              'Ticket này chưa có tài liệu mô tả chi tiết hoặc tiêu chí chấp nhận trong Jira.',
            )}
          </p>
        </div>
      ) : (
        <div className="text-sm text-foreground leading-relaxed select-text font-normal font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              // Headings
              h1: ({ children }) => (
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-3 pb-1 border-b border-border/50 font-heading">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold tracking-tight text-foreground pt-3 pb-1 border-b border-border/40 font-heading">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground pt-3 pb-1 border-b border-border/40 font-heading">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground/80 pt-2.5 pb-0.5">
                  {children}
                </h4>
              ),

              // Horizontal Rule: renders clean border line
              hr: () => <hr className="border-t border-border my-4" />,

              // Paragraphs
              p: ({ children }) => (
                <p className="mb-2 leading-relaxed text-foreground/95">{children}</p>
              ),

              // Lists with authentic Jira nesting (bullet level 1: disc, level 2: circle, level 3: square)
              ul: ({ children }) => (
                <ul className="space-y-1.5 pl-5 my-1.5 list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square] marker:text-foreground/60">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-1.5 pl-5 my-1.5 list-decimal marker:font-semibold marker:text-foreground/80">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,

              // Blockquote
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/70 pl-3.5 py-1 italic text-muted-foreground my-2 bg-muted/20 rounded-r">
                  {children}
                </blockquote>
              ),

              // Tables with ONE Brand Guidelines & Jira Cloud elegance
              table: ({ children }) => (
                <div className="my-4 overflow-hidden rounded-lg border border-border bg-card/60 shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">{children}</table>
                  </div>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/60 dark:bg-muted/30 border-b border-border text-foreground">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-border/60">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-muted/30 transition-colors duration-150 even:bg-muted/15">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase select-none">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm text-foreground/90 align-top leading-relaxed first:font-medium first:text-foreground">
                  {children}
                </td>
              ),

              // Code (Inline & Block)
              code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                const codeText =
                  typeof children === 'string'
                    ? children
                    : Array.isArray(children)
                      ? children.filter((c): c is string => typeof c === 'string').join('')
                      : '';
                const isBlock = Boolean(className) || codeText.includes('\n');

                if (isBlock) {
                  return (
                    <div className="group relative my-3 rounded-lg border border-border bg-slate-50/80 dark:bg-slate-900/50 overflow-hidden transition-colors">
                      {/* Floating Copy Button on top-right */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard.writeText(codeText);
                            toast.success(t('room.codeCopied', 'Đã sao chép mã!'));
                          }}
                          className="h-6 px-2 rounded-md bg-background/90 backdrop-blur-xs border border-border text-muted-foreground hover:text-foreground text-[11px] font-mono inline-flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                          title={t('jira.copy', 'Sao chép')}
                        >
                          <Copy className="size-3" />
                          <span>{t('jira.copy', 'Sao chép')}</span>
                        </button>
                      </div>

                      <pre className="p-3.5 overflow-x-auto font-mono text-xs text-foreground/90 leading-relaxed selection:bg-primary/20 code-highlight-theme">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                }

                // Inline code
                return (
                  <code
                    className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-muted text-foreground font-medium border border-border mx-0.5"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },

              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium transition-colors"
                >
                  <span>{children}</span>
                  <ExternalLink className="size-3 inline ml-0.5" />
                </a>
              ),
            }}
            rehypePlugins={[[rehypeHighlight, { detect: true }]]}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
