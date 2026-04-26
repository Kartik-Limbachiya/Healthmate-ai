"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/lib/auth-guard";
import { db } from "@/firebase-config";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Clock, Trash2, Image as ImageIcon, Star, UploadCloud, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

interface Rating {
  userId: string;
  value: number;
}

interface Blog {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Timestamp;
  likes: string[];
  ratings: Rating[];
  comments: Comment[];
}

function StarRating({ rating, setRating, readOnly = false, totalRatings = 0, average = 0 }: { rating: number, setRating?: (r: number) => void, readOnly?: boolean, totalRatings?: number, average?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer transition-colors ${
              (readOnly ? average >= star : rating >= star)
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
            onClick={() => !readOnly && setRating && setRating(star)}
            onMouseEnter={() => !readOnly && setRating && setRating(star)}
          />
        ))}
      </div>
      {readOnly && totalRatings > 0 && (
        <span className="text-xs text-muted-foreground ml-1">({average.toFixed(1)} / {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
      )}
      {readOnly && totalRatings === 0 && (
        <span className="text-xs text-muted-foreground ml-1">(No ratings yet)</span>
      )}
    </div>
  );
}

function BlogsContent() {
  const { user, profile } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");
  
  // Create Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interaction State
  const [activeCommentBlogId, setActiveCommentBlogId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");

  // Fetch blogs in real-time
  useEffect(() => {
    const blogsRef = collection(db, "blogs");
    const q = query(blogsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBlogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Blog[];
      setBlogs(fetchedBlogs);
    }, (error) => {
      console.error("Error fetching blogs:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !user) return;

    setIsSubmitting(true);
    try {
      let imageUrl = "";
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const authorName = profile?.name || user.displayName || "Fitness Enthusiast";

      await addDoc(collection(db, "blogs"), {
        userId: user.uid,
        authorName,
        title: newTitle.trim(),
        content: newContent.trim(),
        imageUrl,
        createdAt: Timestamp.now(),
        likes: [],
        comments: [],
        ratings: []
      });
      
      setNewTitle("");
      setNewContent("");
      setSelectedFile(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteDoc(doc(db, "blogs", blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleLikeBlog = async (blogId: string, currentLikes: string[]) => {
    if (!user) return;
    const blogRef = doc(db, "blogs", blogId);
    const hasLiked = currentLikes.includes(user.uid);
    try {
      if (hasLiked) {
        await updateDoc(blogRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(blogRef, { likes: arrayUnion(user.uid) });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleRateBlog = async (blogId: string, currentRatings: Rating[], newRatingValue: number) => {
    if (!user) return;
    const blogRef = doc(db, "blogs", blogId);
    
    // Remove old rating if exists, add new one
    const existingRating = currentRatings.find(r => r.userId === user.uid);
    let updatedRatings = currentRatings;
    
    if (existingRating) {
       updatedRatings = currentRatings.filter(r => r.userId !== user.uid);
    }
    
    updatedRatings = [...updatedRatings, { userId: user.uid, value: newRatingValue }];
    
    try {
      await updateDoc(blogRef, { ratings: updatedRatings });
    } catch (error) {
      console.error("Error rating blog:", error);
    }
  };

  const handleAddComment = async (blogId: string) => {
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
      
      const blogRef = doc(db, "blogs", blogId);
      await updateDoc(blogRef, {
        comments: arrayUnion(newComment)
      });
      
      setCommentContent("");
      setActiveCommentBlogId(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (blogId: string, comment: Comment) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const blogRef = doc(db, "blogs", blogId);
      await updateDoc(blogRef, {
        comments: arrayRemove(comment)
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const displayedBlogs = viewMode === "mine" && user ? blogs.filter(b => b.userId === user.uid) : blogs;

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Fitness Blogs</h1>
          <p className="text-muted-foreground">Read, write, and review in-depth fitness journeys and tips.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === "all" ? "default" : "outline"} onClick={() => setViewMode("all")}>All Blogs</Button>
          <Button variant={viewMode === "mine" ? "default" : "outline"} onClick={() => setViewMode("mine")}>My Blogs</Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} variant={showCreateForm ? "secondary" : "default"}>
            {showCreateForm ? "Cancel" : "Write a Blog"}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Create a New Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div>
                <Input 
                  placeholder="Blog Title (e.g., My 30-Day Keto Journey)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="font-medium text-lg"
                />
              </div>
              <div>
                <Textarea 
                  placeholder="Write your full blog post here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="resize-y min-h-[200px]"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="blog-image"
                    disabled={isSubmitting}
                  />
                  <label 
                    htmlFor="blog-image" 
                    className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {selectedFile ? selectedFile.name : "Upload Cover Image"}
                  </label>
                  {selectedFile && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="text-red-500 h-8 px-2">
                      Clear
                    </Button>
                  )}
                </div>
                <Button type="submit" disabled={!newTitle.trim() || !newContent.trim() || isSubmitting} className="flex items-center gap-2 w-full sm:w-auto">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {isSubmitting ? "Publishing..." : "Publish Blog"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {displayedBlogs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border rounded-lg bg-card shadow-sm">
            No blogs found. Be the first to share your fitness journey!
          </div>
        ) : (
          displayedBlogs.map((blog) => {
            const isLiked = user && blog.likes?.includes(user.uid);
            const likesCount = blog.likes?.length || 0;
            const comments = blog.comments || [];
            const isAuthor = user && blog.userId === user.uid;
            const ratings = blog.ratings || [];
            const avgRating = ratings.length > 0 ? ratings.reduce((acc, curr) => acc + curr.value, 0) / ratings.length : 0;
            const myRating = user ? ratings.find(r => r.userId === user.uid)?.value || 0 : 0;
            
            return (
              <Card key={blog.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {blog.imageUrl && (
                  <div className="w-full h-64 md:h-80 relative bg-muted">
                    <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover" />
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold leading-tight">{blog.title}</h2>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{blog.authorName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {blog.authorName}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {blog.createdAt ? formatDistanceToNow(blog.createdAt.toDate(), { addSuffix: true }) : "just now"}
                        </div>
                      </div>
                    </div>
                    {isAuthor && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(blog.id)} className="text-muted-foreground hover:text-red-500 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{blog.content}</p>
                  
                  {/* Rating Section inside content bottom */}
                  <div className="pt-4 mt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium mb-1 block">Overall Rating</span>
                      <StarRating rating={0} readOnly average={avgRating} totalRatings={ratings.length} />
                    </div>
                    {user && !isAuthor && (
                      <div className="bg-muted/30 p-2 rounded-md">
                        <span className="text-xs font-medium mb-1 block text-muted-foreground">Rate this blog:</span>
                        <StarRating rating={myRating} setRating={(val) => handleRateBlog(blog.id, ratings, val)} />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 flex flex-col items-stretch p-0 border-t">
                  <div className="flex gap-4 p-4">
                    <button 
                      onClick={() => handleLikeBlog(blog.id, blog.likes || [])}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCommentBlogId(activeCommentBlogId === blog.id ? null : blog.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {(comments.length > 0 || activeCommentBlogId === blog.id) && (
                    <div className="p-4 pt-0 space-y-4 border-t border-border/50 bg-background/50">
                      <div className="mt-4 space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 text-sm group">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                {comment.authorName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted/50 rounded-lg p-3 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold">{comment.authorName}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                  </span>
                                  {user && comment.userId === user.uid && (
                                    <button onClick={() => handleDeleteComment(blog.id, comment)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-foreground/80 leading-snug">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {activeCommentBlogId === blog.id && (
                        <div className="flex gap-2 pt-2">
                          <Textarea 
                            placeholder="Add to the discussion..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="min-h-[40px] h-[40px] resize-none text-sm py-2 bg-background"
                          />
                          <Button size="sm" onClick={() => handleAddComment(blog.id)} disabled={!commentContent.trim()}>
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

export default function BlogsPage() {
  return (
    <AuthGuard>
      <BlogsContent />
    </AuthGuard>
  );
}
