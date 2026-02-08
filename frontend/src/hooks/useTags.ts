import { useState, useCallback, useEffect } from 'react';
import { tagAPI } from '../api/flowstate';

const DEMO_EMAIL = "test@mulino.com";

export interface Tag {
    _id?: string;
    email: string;
    tag_name: string;
    tag_description?: string;
    color?: string; // Frontend only, backend doesn't store color yet
}

export function useTags() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTags = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedTags = await tagAPI.getAllForUser(DEMO_EMAIL);
            setTags(fetchedTags);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const addTag = useCallback(async (tagName: string, description?: string) => {
        try {
            await tagAPI.create(DEMO_EMAIL, tagName, description);
            await fetchTags(); // Refresh list
        } catch (error) {
            console.error("Failed to create tag:", error);
        }
    }, [fetchTags]);

    const deleteTag = useCallback(async (tagName: string) => {
        try {
            await tagAPI.delete(DEMO_EMAIL, tagName);
            setTags(prev => prev.filter(t => t.tag_name !== tagName));
        } catch (error) {
            console.error("Failed to delete tag:", error);
        }
    }, []);

    return {
        tags,
        isLoading,
        fetchTags,
        addTag,
        deleteTag
    };
}
