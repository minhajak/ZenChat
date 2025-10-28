import Invites from "../components/Invites";
import FriendSuggestions from "../components/FriendSuggestions";

export default function FriendPage() {
  return (
    <div className="w-full h-full  ">
      <div className="md:card w-full md:max-w-[600px] bg-base-100 md:shadow-xl mx-auto ">
        <div className="card-body items-center text-center bg-base-100">
          <Invites />
          <FriendSuggestions/>
        </div>
      </div>
    </div>
  );
}