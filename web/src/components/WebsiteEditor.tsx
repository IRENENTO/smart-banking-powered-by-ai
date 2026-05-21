import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Save, Loader, CheckCircle, AlertTriangle, Globe, RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface CmsSection {
    id: number;
    page: string;
    section: string;
    content: any;
    updated_at: string;
    updated_by: number;
}

const PAGE_LABELS: Record<string, string> = {
    about: 'About Us',
    contact: 'Contact Us',
    services: 'Services',
    faq: 'FAQ'
};

const WebsiteEditor: React.FC = () => {
    const token = localStorage.getItem('admin_token');
    const [sections, setSections] = useState<CmsSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPage, setSelectedPage] = useState<string>('about');
    const [editContent, setEditContent] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [error, setError] = useState('');
    const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

    const fetchSections = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/cms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSections(res.data.data.sections);
                const selected = res.data.data.sections.find((s: CmsSection) => s.page === selectedPage);
                if (selected) setEditContent(JSON.stringify(selected.content, null, 2));
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load CMS content');
        } finally {
            setLoading(false);
        }
    }, [token, selectedPage]);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    useEffect(() => {
        const section = sections.find(s => s.page === selectedPage);
        if (section) {
            setEditContent(JSON.stringify(section.content, null, 2));
        } else {
            setEditContent('{\n  \n}');
        }
        setSaveStatus('idle');
    }, [selectedPage, sections]);

    const handleSave = useCallback(async () => {
        const section = sections.find(s => s.page === selectedPage);
        if (!section) return;
        setSaving(true);
        setSaveStatus('idle');
        try {
            let parsed;
            try { parsed = JSON.parse(editContent); }
            catch { setError('Invalid JSON format'); setSaving(false); setSaveStatus('error'); return; }

            await axios.put(
                `${API_BASE_URL}/api/admin/cms/${selectedPage}/main`,
                { content: parsed },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaveStatus('saved');
            setError('');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err: any) {
            setSaveStatus('error');
            setError(err.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    }, [selectedPage, editContent, sections, token]);

    const autoSave = useCallback((content: string) => {
        setEditContent(content);
        setSaveStatus('idle');
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            const section = sections.find(s => s.page === selectedPage);
            if (!section) return;
            try {
                const parsed = JSON.parse(content);
                axios.put(
                    `${API_BASE_URL}/api/admin/cms/${selectedPage}/main`,
                    { content: parsed },
                    { headers: { Authorization: `Bearer ${token}` } }
                ).then(() => {
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 3000);
                }).catch(() => {
                    setSaveStatus('error');
                });
            } catch {}
        }, 2000);
    }, [selectedPage, sections, token]);

    const pages = Object.keys(PAGE_LABELS);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading content...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Website Content Editor</h2>
                <div className="flex items-center gap-2">
                    {saveStatus === 'saved' && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                            <CheckCircle size={14} /> Auto-saved
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
                            <AlertTriangle size={14} /> Save failed
                        </span>
                    )}
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors">
                        {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 text-sm">
                    {error}
                </div>
            )}

            {/* Page tabs */}
            <div className="flex gap-2 flex-wrap">
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => setSelectedPage(page)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedPage === page
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Globe size={16} />
                        {PAGE_LABELS[page]}
                    </button>
                ))}
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {PAGE_LABELS[selectedPage]} — JSON Content
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Changes auto-save after 2 seconds
                    </span>
                </div>
                <textarea
                    value={editContent}
                    onChange={(e) => autoSave(e.target.value)}
                    className="w-full h-[500px] p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-0 resize-none focus:outline-none"
                    spellCheck={false}
                />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> Edit the JSON content above. Changes auto-save 2 seconds after you stop typing.
                    The public website pages (About Us, Contact Us, Services, FAQ) will reflect changes immediately.
                </p>
            </div>
        </div>
    );
};

export default WebsiteEditor;
