import { injectable } from "inversify";
import { ArrayHelper, DB, UniqueIdHelper } from "@churchapps/apihelper";
import { Setting } from "../models";

@injectable()
export class SettingRepository {

    public save(setting: Setting) {
        return setting.id ? this.update(setting) : this.create(setting);
    }

    private async create(setting: Setting) {
        setting.id = UniqueIdHelper.shortId();
        const sql = "INSERT INTO settings (id, churchId, keyName, value, public) VALUES (?, ?, ?, ?, ?)";
        const params = [setting.id, setting.churchId, setting.keyName, setting.value, setting.public];
        await DB.query(sql, params);
        return setting;
    }

    private async update(setting: Setting) {
        const sql = "UPDATE settings SET churchId=?, keyName=?, value=?, public=? WHERE id=? AND churchId=?";
        const params = [setting.churchId, setting.keyName, setting.value, setting.public, setting.id, setting.churchId];
        await DB.query(sql, params);
        return setting;
    }

    public loadAll(churchId: string) {
        return DB.query("SELECT * FROM settings WHERE churchId=?;", [churchId]);
    }

    public loadPublicSettings(churchId: string) {
        return DB.query("SELECT * FROM settings WHERE churchId=? AND public=?", [churchId, 1])
    }

    public loadAllPublicSettings() {
        return DB.query("SELECT * FROM settings WHERE public=1;", [])
    }

    public loadMulipleChurches(keyNames: string[], churchIds: string[]) {
        return DB.query("SELECT * FROM settings WHERE keyName in (?) AND churchId IN (?) AND public=1", [keyNames, churchIds])
    }

    public loadByKeyNames(churchId: string, keyNames: string[]) {
        return DB.query("SELECT * FROM settings WHERE keyName in (?) AND churchId=?;", [keyNames, churchId]);
    }

    public convertToModel(churchId: string, data: any) {
        const result: Setting = {
            id: data.id,
            keyName: data.keyName,
            value: data.value,
            public: data.public
        };
        return result;
    }

    public convertAllToModel(churchId: string, data: any[]) {
        const result: Setting[] = [];
        data.forEach(d => result.push(this.convertToModel(churchId, d)));
        return result;
    }

    public getImports(data: any[], playlistId?: string, channelId?: string) {
        let result: any[] = [];
        if (playlistId && channelId) {
            const filteredByPlaylist = data.filter((d) => d.keyName === "autoImportSermons" && d.value.includes(playlistId));
            const filteredByChannel = data.filter((d) => d.keyName === "channelId" && d.value === channelId);
            const channelIds = ArrayHelper.getIds(filteredByChannel, "id");
            const filtered = filteredByPlaylist.filter((d) => { const id = d.value.split("|#"); return channelIds.indexOf(id[1]) >= 0; });
            if (filtered.length > 0) {
                const split = filtered[0].value.split("|#");
                const getChannelId = ArrayHelper.getOne(filteredByChannel, "id", split[1]);
                result = [{ channel: getChannelId, ...filtered[0] }];
            }
        } else {
            const filterByCategory = data.filter((d) => d.keyName === "autoImportSermons");
            if (filterByCategory.length > 0) {
                filterByCategory.forEach((row) => {
                    const split = row.value.split("|#");
                    const getchannel = ArrayHelper.getOne(data, "id", split[1]);
                    result.push({ channel: getchannel, ...row });
                })
            }
        }
        return result;
    }

    public convertAllImports(data: any[]) {
        const result: any[] = [];
        data.forEach((d) => {
            result.push({ id: d.id, churchId: d.churchId, keyName: d.keyName, playlistId: d.value.split("|#")[0], channelId: d?.channel?.value })
        })
        return result;
    }
}