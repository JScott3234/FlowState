import { useState, useCallback, useEffect } from 'react';
import { tagAPI } from '../api/flowstate';

export interface Tag {
    _id?: string;
    email: string;
    tag_name: string;
    tag_description?: string;
    color?: string; // Frontend only, backend doesn't store color yet
}

export function useTags(userEmail: string | null) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTags = useCallback(async () => {
        if (!userEmail) {
            setTags([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const fetchedTags = await tagAPI.getAllForUser(userEmail);
            setTags(fetchedTags);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const addTag = useCallback(async (tagName: string, description?: string) => {
        if (!userEmail) return;

        try {
            await tagAPI.create(userEmail, tagName, description);
            await fetchTags(); // Refresh list
        } catch (error) {
            console.error("Failed to create tag:", error);
        }
    }, [userEmail, fetchTags]);

    const deleteTag = useCallback(async (tagName: string) => {
        if (!userEmail) return;

        try {
            await tagAPI.delete(userEmail, tagName);
            setTags(prev => prev.filter(t => t.tag_name !== tagName));
        } catch (error) {
            console.error("Failed to delete tag:", error);
        }
    }, [userEmail]);

    return {
        tags,
        isLoading,
        fetchTags,
        addTag,
        deleteTag
    };
}
