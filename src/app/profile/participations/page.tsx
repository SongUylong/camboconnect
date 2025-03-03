// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { ParticipationCard } from "@/components/profile/participation-card";
// import { Input } from "@/components/ui/input";
// import { Select } from "@/components/ui/select";
// import { Search } from "lucide-react";

// interface Participation {
//   id: string;
//   title: string;
//   organization: {
//     id: string;
//     name: string;
//     logo?: string;
//   };
//   location: string;
//   startDate: Date;
//   endDate?: Date;
//   status: "active" | "completed" | "upcoming";
//   role: string;
//   description: string;
// }

// export default function ParticipationsPage() {
//   const router = useRouter();
//   const [participations, setParticipations] = useState<Participation[]>([]);
//   const [filter, setFilter] = useState("all");
//   const [search, setSearch] = useState("");
//   const [isLoading, setIsLoading] = useState(true);

//   const filteredParticipations = participations.filter((participation) => {
//     const matchesSearch = participation.title
//       .toLowerCase()
//       .includes(search.toLowerCase()) ||
//       participation.organization.name
//         .toLowerCase()
//         .includes(search.toLowerCase());
//     const matchesFilter = filter === "all" || participation.status === filter;
//     return matchesSearch && matchesFilter;
//   });

//   const handleViewDetails = (id: string) => {
//     router.push(`/opportunities/${id}`);
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">My Participations</h1>
//         <div className="flex gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <Input
//               type="text"
//               placeholder="Search participations..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <Select
//             value={filter}
//             onValueChange={setFilter}
//             className="w-40"
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="completed">Completed</option>
//             <option value="upcoming">Upcoming</option>
//           </Select>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {isLoading ? (
//           <div className="text-center py-8">Loading participations...</div>
//         ) : filteredParticipations.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-gray-500">No participations found</p>
//           </div>
//         ) : (
//           filteredParticipations.map((participation) => (
//             <ParticipationCard
//               key={participation.id}
//               participation={participation}
//               onViewDetails={handleViewDetails}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
