const user_logs = mdapi.query({
    action_name: "user_logs",
    where: {
        "type": {
            "_eq": "用户邀请"
        },
        "content": {
            "_eq": "用户通过邀请码\"null\"完成注册"
        }
    },
    fields: ['id  type  content', {
        response_key: "user_invitechidren",
        action_name: "user",
        fields: "id user_id nickname username avatar{id url}"
    }, {
            response_key: "user",
            action_name: "user_invitechidren",
            fields: "id user_id nickname username avatar{id url}"
        }]
})
return user_logs.map(item => {
    return mdapi.mutation({
        action_name: "update_user_logs_by_pk",
        pk_columns: { id: item.id },
        _set: {
            content: item.content.replace("null", item.user.user_id),
        },
        fields: 'id  type  content'
    })
})