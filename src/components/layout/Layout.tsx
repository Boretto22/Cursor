import { Outlet } from "react-router-dom";
import { TabBar } from "./TabBar";

export function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-24 safe-top">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
