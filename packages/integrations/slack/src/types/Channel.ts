import Topic from "./Topic";

type Channel = {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  created: number;
  is_archives: boolean;
  is_general: boolean;
  unlinked: number;
  name_normalized: string;
  is_shared: boolean;
  parent_conversation: unknown;
  creator: string;
  is_ext_shared: boolean;
  is_org_shared: boolean;
  shared_team_ids: string[];
  pending_shared: unknown[];
  pending_connected_team_ids: unknown[];
  is_pending_ext_shared: boolean;
  is_member: boolean;
  is_private: boolean;
  is_mpim: boolean;
  topic: Topic
  purpose: Topic;
  previous_names: string[];
  num_members: number;
}

export default Channel;