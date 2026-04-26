"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/lib/auth-guard";
import { db } from "@/firebase-config";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Send, Clock, Trash2, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

interface Post {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
  likes: string[];
  comments?: Comment[];
}

function CommunityContent() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");

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
      const authorName = isAnonymous 
        ? "Anonymous (Unverified)" 
        : (profile?.name || user.displayName || "Fitness Enthusiast");

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        authorName,
        content: newPostContent.trim(),
        createdAt: Timestamp.now(),
        likes: [],
        comments: []
      });
      setNewPostContent("");
      setIsAnonymous(false);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post:", error);
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

  const handleAddComment = async (postId: string) => {
    if (!commentContent.trim() || !user) return;
    
    try {
      const authorName = profile?.name || user.displayName || "Fitness Enthusiast";
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: user.uid,
        authorName,
        content: commentContent.trim(),
        createdAt: Date.now()
      };
      
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      
      setCommentContent("");
      setActiveCommentPostId(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (postId: string, comment: Comment) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayRemove(comment)
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
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
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="anonymous" 
                  checked={isAnonymous} 
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1">
                  Post anonymously <ShieldAlert className="w-3 h-3" />
                </label>
              </div>
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
            const comments = post.comments || [];
            const isAuthor = user && post.userId === user.uid;
            
            return (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {post.authorName === "Anonymous (Unverified)" ? "A" : post.authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold">{post.authorName}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : "just now"}
                      </span>
                    </div>
                  </div>
                  {isAuthor && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </CardContent>
                <CardFooter className="bg-muted/50 flex flex-col items-stretch p-0">
                  <div className="flex gap-4 p-4 border-b border-border/50">
                    <button 
                      onClick={() => handleLikePost(post.id, post.likes || [])}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {(comments.length > 0 || activeCommentPostId === post.id) && (
                    <div className="p-4 bg-muted/30 space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 text-sm group">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-background rounded-lg p-3 shadow-sm border border-border/50">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-xs">{comment.authorName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                </span>
                                {user && comment.userId === user.uid && (
                                  <button onClick={() => handleDeleteComment(post.id, comment)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {activeCommentPostId === post.id && (
                        <div className="flex gap-2 pt-2">
                          <Textarea 
                            placeholder="Write a comment..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="min-h-[40px] h-[40px] resize-none text-sm py-2"
                          />
                          <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={!commentContent.trim()}>
                            Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
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
