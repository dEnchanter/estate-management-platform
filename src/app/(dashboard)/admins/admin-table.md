import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  SearchIcon,
} from "lucide-react";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Separator } from "../../../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

const adminTabs = [
  { value: "all", label: "All admins" },
  { value: "operations", label: "Operations" },
  { value: "security", label: "Security" },
];

const tableHeaders = [
  { label: "Admin ID", width: "w-[100px]" },
  { label: "Name and email", width: "flex-1" },
  { label: "Admin type", width: "w-[100px]" },
  { label: "Username", width: "w-[120px]" },
  { label: "Phone no.", width: "w-40" },
  { label: "Actions", width: "w-16" },
];

const adminData = [
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-1.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    initials: "EF",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
  {
    id: "00001C",
    name: "Bonnie Clyde",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-7.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-1.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-10.svg",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
  {
    id: "00001C",
    name: "Bonnie Clyde",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-2.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    initials: "JD",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-5.svg",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    initials: "EF",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-1.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    initials: "EF",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
  {
    id: "00001C",
    name: "Bonnie Clyde",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-7.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-1.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-10.svg",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
  {
    id: "00001C",
    name: "Bonnie Clyde",
    email: "johndoe@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-2.svg",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001A",
    name: "John Doe",
    email: "johndoe@email.com",
    initials: "JD",
    type: "Operations",
    username: "@johndoe",
    phone: "(234) 8012345679",
  },
  {
    id: "00001B",
    name: "Evans Femi",
    email: "evansfemi@email.com",
    avatar: "https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-5.svg",
    type: "Security",
    username: "@evansfemi",
    phone: "(234) 8034802679",
  },
];

const paginationPages = [
  { page: "1", active: true },
  { page: "2", active: false },
  { page: "3", active: false },
  { page: "...", active: false },
  { page: "40", active: false },
];

export const AdminTableSection = (): JSX.Element => {
  return (
    <section className="flex flex-col items-center gap-2 flex-1 self-stretch grow">
      <Card className="w-full bg-white rounded-2xl shadow-app-card">
        <CardContent className="flex items-center gap-[120px] p-4">
          <div className="flex items-center gap-6 flex-1 grow">
            <div className="flex w-[400px] items-center gap-2 p-2.5 bg-[#e7e7ed] rounded-[120px]">
              <SearchIcon className="w-5 h-5 text-[#5b5b66]" />
              <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-sm tracking-[-0.50px] leading-5">
                SearchIcon
              </span>
            </div>
            <img
              alt="Icon"
              src="https://c.animaapp.com/mgnze4u4mbMu9T/img/icon-1.svg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="inline-flex flex-col items-center justify-center gap-2 p-1 bg-[#bfffe933] rounded-2xl overflow-hidden border-[none] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-[0.5px] before:rounded-2xl before:[background:linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.4)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="flex w-[360px] items-center gap-4 pl-2 pr-3 py-2 bg-white rounded-[14px] overflow-hidden shadow-[0px_8px_16px_#0f3f2f80]">
          <Avatar className="w-9 h-9">
            <AvatarImage src="https://c.animaapp.com/mgnze4u4mbMu9T/img/avatar-9.svg" />
          </Avatar>
          <div className="flex flex-col items-start flex-1 grow">
            <p className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-base tracking-[-0.50px] leading-6">
              <span className="tracking-[-0.08px]">Admin </span>
              <span className="[font-family:'SF_Pro-Bold',Helvetica] font-bold tracking-[-0.08px]">
                John Doe
              </span>
              <span className="tracking-[-0.08px]"> created successfully!</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-3 py-2 self-stretch w-full">
        <div className="flex flex-col items-start px-3 py-0 flex-1 grow">
          <h1 className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-2xl tracking-[-1.00px] leading-8">
            Admins
          </h1>
          <nav className="flex items-center gap-2">
            <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#acacbf] text-sm tracking-[-0.80px] leading-5">
              Home
            </span>
            <Separator
              orientation="vertical"
              className="h-3 w-px bg-[#acacbf]"
            />
            <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-[#5b5b66] text-sm tracking-[-0.80px] leading-5">
              All admins
            </span>
          </nav>
        </div>
        <Button className="h-auto bg-[#1f1f3f] hover:bg-[#1f1f3f]/90 rounded-xl px-6 py-3">
          <span className="[font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-base tracking-[-0.80px] leading-6">
            Create Admin
          </span>
        </Button>
      </div>

      <Card className="flex-1 grow self-stretch w-full shadow-app-card">
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <div className="flex items-center gap-6 self-stretch w-full">
            <Tabs defaultValue="all" className="bg-[#f4f4f9] rounded-xl p-1">
              <TabsList className="bg-transparent gap-0">
                {adminTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-lg px-4 py-2"
                  >
                    <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base tracking-[-0.80px] leading-6">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <FilterIcon className="w-5 h-5 text-[#5b5b66]" />
          </div>

          <div className="flex flex-col items-start gap-2 flex-1 self-stretch w-full grow">
            <header className="flex items-center gap-6 p-2 self-stretch w-full bg-[#f4f4f9] rounded-lg">
              {tableHeaders.map((header, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-start justify-center ${header.width} ${
                    index < tableHeaders.length - 1
                      ? "border-r border-[#e5e5ea]"
                      : ""
                  }`}
                >
                  <span className="[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#242426] text-base tracking-[-0.80px] leading-6">
                    {header.label}
                  </span>
                </div>
              ))}
            </header>

            <ScrollArea className="flex-1 self-stretch w-full grow overflow-y-scroll">
              <div className="flex flex-col items-start">
                {adminData.map((admin, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-6 p-2 self-stretch w-full border-b border-[#f4f4f9]"
                  >
                    <div className="flex flex-col w-[100px] items-start justify-center border-r border-[#eaeaef]">
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-base tracking-[-0.80px] leading-6">
                        {admin.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-1 grow border-r border-[#eaeaef]">
                      {admin.avatar ? (
                        <Avatar className="w-9 h-9 rounded-lg">
                          <AvatarImage src={admin.avatar} />
                        </Avatar>
                      ) : (
                        <Avatar className="w-9 h-9 bg-[#e5e5ea] rounded-lg">
                          <AvatarFallback className="bg-transparent [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#2f5fbf] text-base tracking-[-0.80px] leading-6">
                            {admin.initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col items-start flex-1 grow">
                        <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-base tracking-[-0.80px] leading-6">
                          {admin.name}
                        </span>
                        <span className="[font-family:'SF_Pro-Light',Helvetica] font-light text-[#5b5b66] text-base tracking-[-0.80px] leading-4">
                          {admin.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col w-[100px] items-start justify-center border-r border-[#eaeaef]">
                      <Badge
                        className={`h-auto px-2 py-1 rounded-lg ${
                          admin.type === "Operations"
                            ? "bg-[#e8e8fc] text-[#0000ff] hover:bg-[#e8e8fc]"
                            : "bg-[#e8f5fc] text-[#006699] hover:bg-[#e8f5fc]"
                        }`}
                      >
                        <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-base tracking-[-0.80px] leading-6">
                          {admin.type}
                        </span>
                      </Badge>
                    </div>

                    <div className="flex flex-col w-[120px] items-start justify-center border-r border-[#eaeaef]">
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-base tracking-[-0.80px] leading-6">
                        {admin.username}
                      </span>
                    </div>

                    <div className="flex flex-col w-40 items-start justify-center border-r border-[#eaeaef]">
                      <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#242426] text-base tracking-[-0.80px] leading-6">
                        {admin.phone}
                      </span>
                    </div>

                    <img
                      alt="Actions"
                      src="https://c.animaapp.com/mgnze4u4mbMu9T/img/actions.svg"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <footer className="flex items-center gap-16 p-2 self-stretch w-full bg-[#f4f4f9] rounded-lg">
              <div className="inline-flex items-center gap-2 px-0 py-3">
                <span className="[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66] text-base tracking-[-0.80px] leading-4">
                  Showing 12 of 480 admins
                </span>
              </div>

              <div className="flex items-center justify-center flex-1 grow">
                {paginationPages.map((pageItem, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`h-auto w-10 p-3 hover:bg-transparent ${
                      pageItem.active ? "" : ""
                    }`}
                  >
                    <span
                      className={`${
                        pageItem.active
                          ? "[font-family:'SF_Pro-Semibold',Helvetica] font-normal text-[#1f1f3f]"
                          : "[font-family:'SF_Pro-Regular',Helvetica] font-normal text-[#5b5b66]"
                      } text-base tracking-[-0.80px] leading-4 text-center`}
                    >
                      {pageItem.page}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-auto w-auto p-2"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-[#5b5b66]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-auto w-auto p-2"
                >
                  <ChevronRightIcon className="w-5 h-5 text-[#5b5b66]" />
                </Button>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
