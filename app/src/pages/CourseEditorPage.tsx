import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Course, Section, Page, Block, BlockType, BlockContent, TextBlockContent, PredictionBlockContent, FillBlankBlockContent, YoutubeBlockContent, SliderBlockContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, BookOpen, FileText, HelpCircle, Lightbulb, Edit3, Youtube, Gauge, Save, ArrowLeft, ArrowUp, ArrowDown, Puzzle } from 'lucide-react';
import { toast } from 'sonner';

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'text', label: 'Text (Markdown)', icon: FileText },
  { type: 'prediction', label: 'Prediction', icon: Lightbulb },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle },
  { type: 'fill_blank', label: 'Fill in Blank', icon: Edit3 },
  { type: 'youtube', label: 'YouTube Video', icon: Youtube },
  { type: 'slider', label: 'Check Yourself Slider', icon: Gauge },
];

export function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || '0');
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isEditBlockDialogOpen, setIsEditBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>('text');
  const [blockContent, setBlockContent] = useState<BlockContent>({ markdown: '' });

  useEffect(() => { loadCourse(); }, [courseId]);

  const loadCourse = async () => {
    try {
      const data = await api.getCourse(courseId);
      setCourse(data);
    } catch { toast.error('Failed to load course'); }
    finally { setIsLoading(false); }
  };

  const handleCreateSection = async () => {
    try {
      await api.createSection(courseId, { title: newSectionTitle });
      toast.success('Section created');
      setIsSectionDialogOpen(false); setNewSectionTitle('');
      loadCourse();
    } catch { toast.error('Failed to create section'); }
  };

  const handleCreatePage = async () => {
    if (!selectedSection) return;
    try {
      await api.createPage(selectedSection.id, { title: newPageTitle });
      toast.success('Page created');
      setIsPageDialogOpen(false); setNewPageTitle('');
      loadCourse();
    } catch { toast.error('Failed to create page'); }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Delete this section and all its pages?')) return;
    try {
      await api.deleteSection(sectionId);
      toast.success('Section deleted'); loadCourse();
    } catch { toast.error('Failed to delete section'); }
  };

  const handleDeletePage = async (pageId: number) => {
    if (!confirm('Delete this page and all its content?')) return;
    try {
      await api.deletePage(pageId);
      toast.success('Page deleted');
      if (selectedPage?.id === pageId) setSelectedPage(null);
      loadCourse();
    } catch { toast.error('Failed to delete page'); }
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (!confirm('Delete this block?')) return;
    try {
      await api.deleteBlock(blockId);
      toast.success('Block deleted');
      if (selectedPage) {
        const page = await api.getPage(selectedPage.id);
        setSelectedPage(page);
      }
    } catch { toast.error('Failed to delete block'); }
  };

  const handleCreateBlock = async () => {
    if (!selectedPage) return;
    try {
      const position = (selectedPage.blocks?.length || 0);
      await api.createBlock(selectedPage.id, selectedBlockType, blockContent, position);
      toast.success('Block created');
      setIsBlockDialogOpen(false);
      setBlockContent({ markdown: '' });
      const page = await api.getPage(selectedPage.id);
      setSelectedPage(page);
    } catch { toast.error('Failed to create block'); }
  };

  const handleUpdateBlock = async () => {
    if (!editingBlock) return;
    try {
      await api.updateBlock(editingBlock.id, blockContent);
      toast.success('Block updated');
      setIsEditBlockDialogOpen(false);
      setEditingBlock(null);
      if (selectedPage) {
        const page = await api.getPage(selectedPage.id);
        setSelectedPage(page);
      }
    } catch { toast.error('Failed to update block'); }
  };

  const openEditBlock = (block: Block) => {
    setEditingBlock(block);
    setSelectedBlockType(block.type);
    setBlockContent(block.content);
    setIsEditBlockDialogOpen(true);
  };

  const moveBlock = async (block: Block, direction: 'up' | 'down') => {
    if (!selectedPage?.blocks) return;
    const blocks = [...selectedPage.blocks].sort((a, b) => a.position - b.position);
    const idx = blocks.findIndex(b => b.id === block.id);
    if (direction === 'up' && idx > 0) {
      const other = blocks[idx - 1];
      await api.updateBlockPosition(block.id, other.position);
      await api.updateBlockPosition(other.id, block.position);
    } else if (direction === 'down' && idx < blocks.length - 1) {
      const other = blocks[idx + 1];
      await api.updateBlockPosition(block.id, other.position);
      await api.updateBlockPosition(other.id, block.position);
    }
    const page = await api.getPage(selectedPage.id);
    setSelectedPage(page);
  };

  const getDefaultBlockContent = (type: BlockType): BlockContent => {
    switch (type) {
      case 'text': return { markdown: '# Heading\n\nWrite your content here using **markdown** formatting.' };
      case 'prediction':
      case 'quiz':
        return { question: 'What is your question?', options: ['Option 1', 'Option 2', 'Option 3'], correct: 0, explanation: 'Explain the correct answer here.' };
      case 'fill_blank':
        return { text: 'The sky is ___ and grass is ___.', answers: ['blue', 'green'] };
      case 'youtube':
        return { videoId: 'dQw4w9WgXcQ', title: 'Sample Video' };
      case 'slider':
        return { question: 'Estimate the speed of sound in air (m/s)', min: 0, max: 500, correctMin: 330, correctMax: 350, unit: 'm/s', explanation: 'The speed of sound in air at sea level is approximately 343 m/s (1,125 ft/s).' };
      default: return { markdown: '' };
    }
  };

  const handleBlockTypeChange = (type: BlockType) => {
    setSelectedBlockType(type);
    setBlockContent(getDefaultBlockContent(type));
  };

  const renderBlockEditor = () => {
    switch (selectedBlockType) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label>Markdown Content</Label>
            <Textarea value={(blockContent as TextBlockContent).markdown} onChange={e => setBlockContent({ markdown: e.target.value })} rows={8} />
            <p className="text-xs text-gray-500">Use **bold**, *italic*, # headings, - lists, [links](url)</p>
          </div>
        );
      case 'prediction':
      case 'quiz':
        const qz = blockContent as PredictionBlockContent;
        return (
          <div className="space-y-4">
            <div><Label>Question</Label><Input value={qz.question} onChange={e => setBlockContent({ ...qz, question: e.target.value })} /></div>
            <div><Label>Options (one per line)</Label><Textarea value={qz.options.join('\n')} onChange={e => setBlockContent({ ...qz, options: e.target.value.split('\n').filter(o => o.trim()) })} rows={4} /></div>
            <div><Label>Correct Answer Index (0-based)</Label><Input type="number" min={0} max={qz.options.length - 1} value={qz.correct} onChange={e => setBlockContent({ ...qz, correct: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Explanation</Label><Textarea value={qz.explanation} onChange={e => setBlockContent({ ...qz, explanation: e.target.value })} rows={3} /></div>
          </div>
        );
      case 'fill_blank':
        const fb = blockContent as FillBlankBlockContent;
        return (
          <div className="space-y-4">
            <div><Label>Text (use ___ for blanks)</Label><Textarea value={fb.text} onChange={e => setBlockContent({ ...fb, text: e.target.value })} rows={3} /></div>
            <div><Label>Answers (one per line, in order)</Label><Textarea value={fb.answers.join('\n')} onChange={e => setBlockContent({ ...fb, answers: e.target.value.split('\n').filter(a => a.trim()) })} rows={4} /></div>
          </div>
        );
      case 'youtube':
        const yt = blockContent as YoutubeBlockContent;
        return (
          <div className="space-y-4">
            <div><Label>YouTube Video ID</Label><Input value={yt.videoId} onChange={e => setBlockContent({ ...yt, videoId: e.target.value })} placeholder="e.g., dQw4w9WgXcQ" /></div>
            <div><Label>Video Title</Label><Input value={yt.title || ''} onChange={e => setBlockContent({ ...yt, title: e.target.value })} placeholder="Optional title" /></div>
          </div>
        );
      case 'slider':
        const sl = blockContent as SliderBlockContent;
        return (
          <div className="space-y-4">
            <div><Label>Question</Label><Input value={sl.question} onChange={e => setBlockContent({ ...sl, question: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Value</Label><Input type="number" value={sl.min} onChange={e => setBlockContent({ ...sl, min: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Max Value</Label><Input type="number" value={sl.max} onChange={e => setBlockContent({ ...sl, max: parseInt(e.target.value) || 100 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Correct Min</Label><Input type="number" value={sl.correctMin} onChange={e => setBlockContent({ ...sl, correctMin: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Correct Max</Label><Input type="number" value={sl.correctMax} onChange={e => setBlockContent({ ...sl, correctMax: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>Unit (optional)</Label><Input value={sl.unit || ''} onChange={e => setBlockContent({ ...sl, unit: e.target.value })} placeholder="e.g., m/s, kg, years" /></div>
            <div><Label>Explanation</Label><Textarea value={sl.explanation} onChange={e => setBlockContent({ ...sl, explanation: e.target.value })} rows={3} /></div>
          </div>
        );
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Puzzle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate('/my-courses')} className="mb-4 text-gray-500">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Courses
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-500 mt-1">Edit your course content</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/courses/${course.id}`)}>
          <BookOpen className="h-4 w-4 mr-2" /> Preview
        </Button>
      </div>

      <Tabs defaultValue="structure" className="space-y-6">
        <TabsList>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="content">Page Content</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sections & Pages</h2>
            <Button onClick={() => setIsSectionDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Add Section
            </Button>
          </div>

          <div className="space-y-4">
            {course.sections?.map((section) => (
              <div key={section.id} className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedSection(section); setIsPageDialogOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Page
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSection(section.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 ml-4">
                  {section.pages?.map((page) => (
                    <div key={page.id} className={`flex items-center justify-between p-3 rounded-lg ${selectedPage?.id === page.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{page.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPage(page)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!section.pages || section.pages.length === 0) && (
                    <p className="text-sm text-gray-400 italic">No pages yet</p>
                  )}
                </div>
              </div>
            ))}
            {(!course.sections || course.sections.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No sections yet. Create your first section to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {!selectedPage ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Select a page from the Structure tab to edit its content.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">{selectedPage.title}</h2>
                  <p className="text-sm text-gray-500">Editing page content</p>
                </div>
                <Button onClick={() => { setSelectedBlockType('text'); setBlockContent(getDefaultBlockContent('text')); setIsBlockDialogOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" /> Add Block
                </Button>
              </div>

              <div className="space-y-4">
                {selectedPage.blocks?.sort((a, b) => a.position - b.position).map((block, index, arr) => (
                  <div key={block.id} className="border rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {(() => {
                            const Icon = BLOCK_TYPES.find(t => t.type === block.type)?.icon;
                            return Icon ? <Icon className="h-5 w-5 text-gray-600" /> : null;
                          })()}
                        </div>
                        <div>
                          <span className="font-medium capitalize text-gray-900">{block.type.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-400 ml-2">Block {index + 1}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => moveBlock(block, 'up')} disabled={index === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => moveBlock(block, 'down')} disabled={index === arr.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditBlock(block)}>
                          <Edit className="h-4 w-4 text-indigo-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBlock(block.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500 font-mono overflow-hidden">
                      <pre className="overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(block.content, null, 2).substring(0, 300)}
                        {JSON.stringify(block.content).length > 300 && '...'}
                      </pre>
                    </div>
                  </div>
                ))}
                {(!selectedPage.blocks || selectedPage.blocks.length === 0) && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No content blocks yet. Add your first block to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Section</DialogTitle></DialogHeader>
          <div className="py-4"><Label>Section Title</Label><Input value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} placeholder="e.g., Introduction" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSection} disabled={!newSectionTitle.trim()} className="bg-indigo-600">Create Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Dialog */}
      <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Page</DialogTitle></DialogHeader>
          <div className="py-4"><Label>Page Title</Label><Input value={newPageTitle} onChange={e => setNewPageTitle(e.target.value)} placeholder="e.g., Lesson 1" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePage} disabled={!newPageTitle.trim()} className="bg-indigo-600">Create Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Content Block</DialogTitle>
            <DialogDescription>Choose the type of content block to add.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Block Type</Label>
              <Select value={selectedBlockType} onValueChange={(v) => handleBlockTypeChange(v as BlockType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map(t => <SelectItem key={t.type} value={t.type}><div className="flex items-center gap-2"><t.icon className="h-4 w-4" />{t.label}</div></SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {renderBlockEditor()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBlock} className="bg-indigo-600 hover:bg-indigo-700"><Save className="h-4 w-4 mr-2" />Add Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog open={isEditBlockDialogOpen} onOpenChange={setIsEditBlockDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Block</DialogTitle>
            <DialogDescription>Modify this content block.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Label>Type:</Label>
              <span className="capitalize font-medium">{selectedBlockType.replace('_', ' ')}</span>
            </div>
            {renderBlockEditor()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBlockDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateBlock} className="bg-indigo-600 hover:bg-indigo-700"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
