import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { MapPin, Heart, Route, Calendar, Pencil, User } from "lucide-react";
import { motion } from "framer-motion";

interface PublicProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface LikedItem {
  id: string;
  content_id: string;
  content_type: string;
  created_at: string;
}

interface SavedCity {
  id: string;
  city_name: string;
  state_region: string | null;
  created_at: string;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [likes, setLikes] = useState<LikedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = user?.id === profile?.id;

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, bio, avatar_url, created_at")
        .eq("username", username)
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(data as PublicProfile);

      // Fetch public activity
      const [{ data: cities }, { data: likeData }] = await Promise.all([
        supabase
          .from("saved_cities")
          .select("id, city_name, state_region, created_at")
          .eq("user_id", data.id)
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("likes")
          .select("id, content_id, content_type, created_at")
          .eq("user_id", data.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      setSavedCities(cities || []);
      setLikes(likeData || []);
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-60 h-4" />
          </div>
          <Skeleton className="w-full h-32" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <User className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h1 className="text-2xl font-heading font-bold">User not found</h1>
          <p className="text-muted-foreground text-sm">No user with that username exists.</p>
          <Link to="/">
            <Button variant="outline" className="font-heading mt-2">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = (profile.full_name || profile.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-2xl mx-auto px-6 pb-16">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center gap-4 mb-10"
        >
          <Avatar className="w-24 h-24 ring-4 ring-primary/20">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.username || "User"} />
            ) : null}
            <AvatarFallback className="text-xl font-heading font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-heading font-bold">
              {profile.full_name || profile.username}
            </h1>
            {profile.username && (
              <p className="text-muted-foreground text-sm mt-0.5">@{profile.username}</p>
            )}
          </div>

          {profile.bio && (
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined {joinDate}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {savedCities.length} cities saved
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {likes.length} likes
            </span>
          </div>

          {isOwnProfile && (
            <Link to="/edit-profile">
              <Button variant="outline" size="sm" className="font-heading gap-1.5 mt-1">
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Saved Cities */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Saved Cities
          </h2>
          {savedCities.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No saved cities yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {savedCities.map((city, i) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="glass-card hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <p className="text-sm font-heading font-semibold truncate">{city.city_name}</p>
                      {city.state_region && (
                        <p className="text-[11px] text-muted-foreground truncate">{city.state_region}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Likes */}
        {likes.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" /> Recent Activity
            </h2>
            <div className="flex flex-wrap gap-2">
              {likes.map((like) => (
                <Badge key={like.id} variant="secondary" className="text-xs capitalize">
                  {like.content_type}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
