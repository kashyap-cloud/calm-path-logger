import React, { useState } from "react";
import { Heart, Send, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ScreenTransition from "@/components/trackers/ScreenTransition";

interface Post {
  id: string;
  heading: string;
  content: string;
  source: "OCDTrackers" | "User";
  supportCount: number;
  relateCount: number;
  timeAgo: string;
}

const initialPosts: Post[] = [
  {
    id: "1",
    heading: "Small Win Today",
    content: "Today I noticed an urge to check the stove three times. I sat with it for 5 minutes before moving on. Small wins matter. 💜",
    source: "User",
    supportCount: 24,
    relateCount: 18,
    timeAgo: "2h ago",
  },
  {
    id: "2",
    heading: "Reminder",
    content: "Remember: You are not your thoughts. OCD tries to make you believe otherwise, but thoughts are just mental events, not truths.",
    source: "OCDTrackers",
    supportCount: 89,
    relateCount: 56,
    timeAgo: "4h ago",
  },
  {
    id: "3",
    heading: "Rough Morning",
    content: "Had a rough morning with intrusive thoughts. Decided to go for a walk instead of performing rituals. It didn't feel great, but I'm proud I tried.",
    source: "User",
    supportCount: 42,
    relateCount: 31,
    timeAgo: "5h ago",
  },
  {
    id: "4",
    heading: "Learning to Sit with Uncertainty",
    content: "The uncertainty is uncomfortable, but I'm learning to sit with it. Day 12 of not seeking reassurance. One moment at a time.",
    source: "User",
    supportCount: 67,
    relateCount: 45,
    timeAgo: "8h ago",
  },
  {
    id: "5",
    heading: "Daily Motivation",
    content: "Progress isn't linear. Some days the urges feel stronger. That's okay. What matters is how you respond, not how you feel.",
    source: "OCDTrackers",
    supportCount: 112,
    relateCount: 78,
    timeAgo: "1d ago",
  },
  {
    id: "6",
    heading: "First Time Here",
    content: "First time sharing here. Been struggling silently for years. Just knowing others understand means everything. 🌿",
    source: "User",
    supportCount: 156,
    relateCount: 98,
    timeAgo: "1d ago",
  },
];

const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newHeading, setNewHeading] = useState("");
  const [newPost, setNewPost] = useState("");
  const [userReactions, setUserReactions] = useState<Record<string, { supported: boolean; related: boolean }>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editHeading, setEditHeading] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleSupport = (postId: string) => {
    const current = userReactions[postId] || { supported: false, related: false };
    setUserReactions({
      ...userReactions,
      [postId]: { ...current, supported: !current.supported },
    });
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, supportCount: current.supported ? p.supportCount - 1 : p.supportCount + 1 }
        : p
    ));
  };

  const handleRelate = (postId: string) => {
    const current = userReactions[postId] || { supported: false, related: false };
    setUserReactions({
      ...userReactions,
      [postId]: { ...current, related: !current.related },
    });
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, relateCount: current.related ? p.relateCount - 1 : p.relateCount + 1 }
        : p
    ));
  };

  const handleSubmitPost = () => {
    if (!newPost.trim() || !newHeading.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      heading: newHeading,
      content: newPost,
      source: "User",
      supportCount: 0,
      relateCount: 0,
      timeAgo: "Just now",
    };

    setPosts([post, ...posts]);
    setNewPost("");
    setNewHeading("");
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditHeading(post.heading);
    setEditContent(post.content);
  };

  const handleSaveEdit = () => {
    if (!editHeading.trim() || !editContent.trim() || !editingPostId) return;

    setPosts(posts.map(p =>
      p.id === editingPostId
        ? { ...p, heading: editHeading, content: editContent }
        : p
    ));
    setEditingPostId(null);
    setEditHeading("");
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditHeading("");
    setEditContent("");
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const canShare = newHeading.trim() && newPost.trim();

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="gradient-hero pt-12 pb-6 px-5 rounded-b-[2rem]">
        <ScreenTransition>
          <div className="text-center text-white">
            <h1 className="text-xl font-bold mb-1">Community</h1>
            <p className="text-white/80 text-xs">A safe space to share and connect</p>
          </div>
        </ScreenTransition>
      </div>

      <div className="px-4 py-4">
        {/* Post Creation */}
        <ScreenTransition delay={100}>
          <div className="bg-white rounded-2xl p-4 shadow-soft mb-5 border border-border/50">
            <Input
              placeholder="Give your post a heading (e.g., Reminder, Small Win)"
              value={newHeading}
              onChange={(e) => setNewHeading(e.target.value)}
              className="border-0 bg-muted/30 rounded-xl text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30 mb-3"
            />
            <Textarea
              placeholder="Share what's on your mind... Your name stays anonymous 💜"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="border-0 bg-muted/30 rounded-xl resize-none text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30 min-h-[80px]"
            />
            <div className="flex justify-end mt-3">
              <Button
                onClick={handleSubmitPost}
                disabled={!canShare}
                size="sm"
                className={cn(
                  "rounded-full px-4 border-0 transition-all",
                  canShare
                    ? "gradient-purple text-white"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </ScreenTransition>

        {/* Feed */}
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-4">
            {posts.map((post, index) => {
              const reactions = userReactions[post.id] || { supported: false, related: false };
              const isEditing = editingPostId === post.id;
              const isUserPost = post.source === "User";

              return (
                <ScreenTransition key={post.id} delay={150 + index * 50}>
                  <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/30">
                    {/* Source Tag & Menu */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                          post.source === "OCDTrackers"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary"
                        )}
                      >
                        {post.source === "OCDTrackers" ? "🌟 OCDTrackers" : "👤 User"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{post.timeAgo}</span>
                        {isUserPost && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-muted rounded-full transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={() => handleEditPost(post)} className="cursor-pointer">
                                <Pencil className="w-3.5 h-3.5 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePost(post.id)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <Input
                          value={editHeading}
                          onChange={(e) => setEditHeading(e.target.value)}
                          className="border-0 bg-muted/30 rounded-xl text-sm focus-visible:ring-primary/30"
                          placeholder="Heading"
                        />
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="border-0 bg-muted/30 rounded-xl resize-none text-sm focus-visible:ring-primary/30 min-h-[60px]"
                          placeholder="Content"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={handleCancelEdit}
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveEdit}
                            size="sm"
                            disabled={!editHeading.trim() || !editContent.trim()}
                            className="rounded-full text-xs gradient-purple text-white border-0"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <>
                        {/* Heading */}
                        <h3 className="text-sm font-semibold text-foreground mb-2">{post.heading}</h3>

                        {/* Content */}
                        <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                          {post.content}
                        </p>

                        {/* Reactions */}
                        <div className="flex gap-3 pt-2 border-t border-border/30">
                          <button
                            onClick={() => handleSupport(post.id)}
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all",
                              reactions.supported
                                ? "bg-rose-100 text-rose-600"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Heart className={cn("w-3.5 h-3.5", reactions.supported && "fill-current")} />
                            Support · {post.supportCount}
                          </button>
                          <button
                            onClick={() => handleRelate(post.id)}
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all",
                              reactions.related
                                ? "bg-primary/10 text-primary"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            🤝 I Relate · {post.relateCount}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </ScreenTransition>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CommunityFeed;
