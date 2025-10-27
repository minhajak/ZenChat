import Invites from "../components/Invites";
import FriendSuggestions from "../components/FriendSuggestions";

export default function FriendPage() {
  return (
    <div className=" w-full h-full mx-auto px-4 pt-5">
      <div className="card w-full max-w-[600px] bg-base-100 shadow-xl mx-auto ">
        <div className="card-body items-center text-center bg-base-100">
          <Invites />
          <FriendSuggestions/>
        </div>
      </div>
    </div>
  );
}