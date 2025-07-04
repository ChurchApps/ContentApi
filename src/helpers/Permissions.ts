import { BasePermissions } from "@churchapps/apihelper";

export class Permissions extends BasePermissions {
  static content = {
    edit: { contentType: "Content", action: "Edit" }
  };
  static chat = {
    host: { contentType: "Chat", action: "Host" }
  };
  static streamingServices = {
    edit: { contentType: "StreamingServices", action: "Edit" }
  };
}
