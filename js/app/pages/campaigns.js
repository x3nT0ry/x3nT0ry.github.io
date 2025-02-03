export const campaigns = {
    data: function () {
        return {
            parent: "",
            data: {},
            details: {},
            date: "",
            date2: "",
            q: "",
            sort: "",
            loader: 1,
            id: 0,
            type: 0,
            all: true,
            
        };
    },
    mounted: function () {
        this.parent = this.$parent.$parent;
        if (!this.parent.user) {
            this.parent.logout();
        }
        this.get();
        this.GetFirstAndLastDate();
    },
    methods: {
        GetFirstAndLastDate: function () {
            var year = new Date().getFullYear();
            var month = new Date().getMonth();
            var firstDayOfMonth = new Date(year, month, 2);
            var lastDayOfMonth = new Date(year, month + 1, 1);

            this.date = firstDayOfMonth.toISOString().substring(0, 10);
            this.date2 = lastDayOfMonth.toISOString().substring(0, 10);
        },
        get: function () {
            var self = this;
            var data = self.parent.toFormData(self.parent.formData);
            if (this.date !== "") data.append("date", this.date);
            if (this.date2 !== "") data.append("date2", this.date2);
            self.loader = 1;
            axios
                .post(
                    this.parent.url +
                        "/site/getCampaigns?auth=" +
                        this.parent.user.auth,
                    data
                )
                .then(function (response) {
                    self.data = response.data;
                    self.loader = 0;
                })
                .catch(function (error) {
                    self.parent.logout();
                });
        },
        action: function () {
            var self = this;
            self.parent.formData.copy = "";
            var data = self.parent.toFormData(self.parent.formData);
            axios
                .post(
                    this.parent.url +
                        "/site/actionCampaign?auth=" +
                        this.parent.user.auth,
                    data
                )
                .then(function (response) {
                    self.$refs.new.active = 0;
                    if (self.parent.formData.id) {
                        self.$refs.header.$refs.msg.successFun(
                            "Successfully updated campaign!"
                        );
                    } else {
                        self.$refs.header.$refs.msg.successFun(
                            "Successfully added new campaign!"
                        );
                    }
                    self.get();
                })
                .catch(function (error) {
                    console.log("errors: ", error);
                });
        },
        del: async function () {
            if (
                await this.$refs.header.$refs.msg.confirmFun(
                    "Please confirm next action",
                    "Do you want to delete this campaign?"
                )
            ) {
                var self = this;
                var data = self.parent.toFormData(self.parent.formData);
                axios
                    .post(
                        this.parent.url +
                            "/site/deleteCampaign?auth=" +
                            this.parent.user.auth,
                        data
                    )
                    .then(function (response) {
                        if (response.data.error) {
                            self.$refs.header.$refs.msg.alertFun(
                                response.data.error
                            );
                        } else {
                            self.$refs.header.$refs.msg.successFun(
                                "Successfully deleted campaign!"
                            );
                            self.get();
                        }
                    })
                    .catch(function (error) {
                        console.log("errors: ", error);
                    });
            }
        },
    },
    template: `
    <div class="inside-content"> 
        <Header ref="header" />
        <div id='spinner' v-if="loader"></div> 
        <div class="wrapper"> 
            <div class="flex panel"> 
                <div class="w20 ptb30"> 
                    <h1>Campaigns</h1> 
                </div> 
                <div class="w60 ptb28 ac">
                   <input type="date" v-model="date" @change="get()" /> <span style="font-size: 17px; font-weight: bold;"> - </span> <input type="date" v-model="date2" @change="get()" />

                </div> 
                <div class="w20 al ptb20"> 
                    <a class="btnS" href="#" @click.prevent="parent.formData={};$refs.new.active=1"><i class="fas fa-plus"></i> New</a>
                </div> 
            </div>
        <popup ref="new" :title="(parent.formData && parent.formData.id) ? 'Edit campaign' : 'New campaign'">
            <div class="form inner-form"> 
                <form @submit.prevent="action()" v-if="parent.formData"> 
                    <div class="rows"> 
                        <label class="custom-label" >Name</label> 
                        <input type="text" v-model="parent.formData.title" required> 
                    </div> 
                    <div class="rows"> 
                        <button class="btn" v-if="parent.formData && parent.formData.id">Edit</button> 
                        <button class="btn" v-if="parent.formData && !parent.formData.id">Add</button> 
                    </div> 
                </form> 
            </div> 
        </popup>
            <div class="table" v-if="data.items != ''"> 
                <table> 
                    <thead> 
                        <tr> 
                            <th class="id">#</th> 
                            <th class="id"></th> 
                            <th>Title</th> 
                            <th class="id">Views</th> 
                            <th class="id">Clicks</th> 
                            <th class="id">Leads</th> 
                            <th class="id">Fraud clicks</th> 
                            <th class="actions">Actions</th> 
                        </tr> 
                    </thead> 
                    <tbody> 
                        <tr v-for="(item, i) in data.items" >
                            <td class="id">{{ item.id }}</td> 
                            <td class="id"> 
                            <toogle v-model="item.published" @update:modelValue="parent.formData = item; action();" />
                            </td> 
                            <td>
                                <router-link :to="'/campaign/' + item.id">{{ item.title }}</router-link>
                            </td> 
                            <td class="id"> 
                                <a href="#" @click.prevent="$refs.details.active = 1; getDetails(item.id, 1)"> 
                                    {{ item.views }} 
                                </a> 
                            </td> 
                            <td class="id"> 
                                <a href="#" @click.prevent="$refs.details.active = 1; getDetails(item.id, 2)"> 
                                    <template v-if="item.clicks">{{ item.clicks }}</template> 
                                    <template v-if="!item.clicks">0</template>
                                </a> 
                            </td>
                            <td class="id"> 
                                <a href="#" @click.prevent="$refs.details.active = 1; getDetails(item.id, 3)"> 
                                    <template v-if="item.leads">{{ item.leads }}</template> 
                                   <template v-if="!item.leads">0</template>
                                </a> 
                            </td> 
                            <td class="id"> 
                                <a href="#" @click.prevent="$refs.details.active = 1; getDetails(item.id, 4)"> 
                                    <template v-if="item.fclicks">{{ item.fclicks }}</template> 
                                   <template v-if="!item.fclicks">0</template>
                                </a> 
                            </td> 
                            <td class="actions"> 
                                <a href="#" @click.prevent="parent.formData = item; del();"> 
                                    <i class="fas fa-trash-alt"></i> 
                                </a> 
                            </td> 
                        </tr> 
                    </tbody> 
                </table>
            </div> 
            <div class="empty" v-if="data.items == ''"> 
                No items 
            </div> 
        </div> 
    </div>
    `,
};
