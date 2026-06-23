import ProfileClient from './profile-client';
export default function ProfilePage({ params }: { params: { userId: string } }) { return <ProfileClient userId={params.userId} />; }
