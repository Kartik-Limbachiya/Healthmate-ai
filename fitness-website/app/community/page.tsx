"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/lib/auth-guard";
import { db } from "@/firebase-config";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Send, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
  likes: string[];
}

function CommunityContent() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch posts in real-time
  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(fetchedPosts);
    }, (error) => {
      console.error("Error fetching posts:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const authorName = profile?.name || user.displayName || "Fitness Enthusiast";
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        authorName,
        content: newPostContent.trim(),
        createdAt: Timestamp.now(),
        likes: []
      });
      setNewPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string, currentLikes: string[]) => {
    if (!user) return;
    
    const postRef = doc(db, "posts", postId);
    const hasLiked = currentLikes.includes(user.uid);

    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Community Feed</h1>
        <p className="text-muted-foreground">Share your progress, routines, and diet plans with other HealthMate users.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Textarea 
              placeholder="What's on your mind? Share your latest workout, meal, or thoughts..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="resize-none min-h-[120px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newPostContent.trim() || isSubmitting} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = user && post.likes?.includes(user.uid);
            const likesCount = post.likes?.length || 0;
            
            return (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {post.authorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold">{post.authorName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : "just now"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </CardContent>
                <CardFooter className="bg-muted/50 py-3 flex gap-4">
                  <button 
                    onClick={() => handleLikePost(post.id, post.likes || [])}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-not-allowed opacity-50" title="Coming soon">
                    <MessageSquare className="w-5 h-5" />
                    <span>Comment</span>
                  </button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <AuthGuard>
      <CommunityContent />
    </AuthGuard>
  );
}
