
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useHeader } from "@/context/headerContext";
import { useNavigate } from "react-router-dom";


export function NavMain({
  items
}) {
  const { toggleSidebar } = useSidebar();
  const {setHeaderText}=useHeader();
  const Navigate = useNavigate();
  const clickHandler = (item) => {
    Navigate(item.url);
    setHeaderText(item.title)
       // toggleSidebar();
  }
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">

        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} onClick={() => clickHandler(item)} className="data-[slot=sidebar-menu-item]:!p-1.5">
              <SidebarMenuButton>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
