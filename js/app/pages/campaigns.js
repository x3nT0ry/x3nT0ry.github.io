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
            iChart: -1,
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
                    if (self.iChart != -1)
                        self.line(self.data.items[self.iChart]);
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
                    if (response.data.error) {
                        self.$refs.header.$refs.msg.alertFun(
                            response.data.error
                        );
                    } else if (self.parent.formData.id) {
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

        line: function (item) {
            setTimeout(function () {
                let dates = [];
                let clicks = [];
                let views = [];

                if (item && item["line"]) {
                    for (let i in item["line"]) {
                        dates.push(i);
                        clicks.push(item["line"][i].clicks);
                        views.push(item["line"][i].views);
                    }
                }

                document.getElementById("chartOuter").innerHTML = `
                    <div id="chartHints">
                        <div class="chartHintsViews">Views</div>
                        <div class="chartHintsClicks">Clicks</div>
                    </div>
                    <canvas id="myChart"></canvas>
                `;

                const ctx = document.getElementById("myChart");
                const xScaleImage = {
                    id: "xScaleImage",
                    afterDatasetsDraw(chart, args, plugins) {
                        const {
                            ctx,
                            data,
                            chartArea: { bottom },
                            scales: { x },
                        } = chart;
                        ctx.save();
                        if (data.images) {
                            data.images.forEach((image, index) => {
                                const label = new Image();
                                label.src = image;

                                const width = 120;
                                ctx.drawImage(
                                    label,
                                    x.getPixelForValue(index) - width / 2,
                                    x.top,
                                    width,
                                    width
                                );
                            });
                        }
                    },
                };

                new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: "Clicks",
                                backgroundColor: "#00599D",
                                borderColor: "#00599D",
                                data: clicks,
                            },
                            {
                                label: "Views",
                                backgroundColor: "#500088",
                                borderColor: "#5000B8",
                                data: views,
                                yAxisID: "y2",
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            tooltip: {
                                bodyFontSize: 20,
                                usePointStyle: true,
                                callbacks: {
                                    title: (ctx) => {
                                        return ctx[0]["dataset"].label;
                                    },
                                },
                            },
                            legend: {
                                display: false,
                            },
                        },
                        categoryPercentage: 0.2,
                        barPercentage: 0.8,
                        scales: {
                            y: {
                                id: "y2",
                                position: "right",
                            },
                            x: {
                                afterFit: (scale) => {
                                    scale.height = 120;
                                },
                            },
                        },
                    },
                });
            }, 100);
        },

        checkAll: function (prop) {
            if (this.data.items[this.iChart].sites) {
                for (let i in this.data.items[this.iChart].sites) {
                    this.data.items[this.iChart].sites[i].include = prop;
                }
            }
            this.parent.formData = this.data.items[this.iChart];
            this.get();
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
                   <input type="date" v-model="date" @change="get()" /> 
                   <span style="font-size: 17px; font-weight: bold;"> - </span> 
                   <input type="date" v-model="date2" @change="get()" />
                </div> 
                <div class="w20 al ptb20"> 
                    <a class="btnS" href="#" @click.prevent="parent.formData={};$refs.new.active=1">
                        <i class="fas fa-plus"></i> New
                    </a>
                </div> 
            </div>
            
            <popup ref="chart" fullscreen="true" title="Chart">
                <div class="flex panels">
                    <div class="w30 ptb25">
                        <input class="data" type="date" v-model="date" @change="get();" />
                        <span style="font-size: 17px; font-weight: bold;"> - </span> 
                        <input class="data" type="date" v-model="date2" @change="get()" />
                    </div>
                    <div class="w70 a1">
                        <div class="flex cubes">
                            <div class="w30 clicks">
                                <div>Clicks</div>
                                {{ data.items[iChart].clicks }}
                            </div>
                            <div class="w30 views">
                                <div>Views</div>
                                {{ data.items[iChart].views }}
                            </div>
                            <div class="w30 leads">
                                <div>Leads</div>
                                {{ data.items[iChart].leads }}
                            </div>
                            <div class="w30 ctr">
                                <div>CTR</div>
                                {{ ((data.items[iChart].clicks * 100) / data.items[iChart].views).toFixed(2) }} %
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex body">
                    <div class="w30 ar filchart">
                        <div class="itemchart ptb10" v-if="all">
                            <toogle v-model="all" @update:modelValue="all = $event; checkAll(all)" />
                            All
                        </div>

                        <div class="itemchart ptb10"
                             v-if="data.items[iChart].sites"
                             v-for="s in data.items[iChart].sites">
                            <toogle v-model="s.include"
                                @update:modelValue="
                                    val => {
                                        s.include = val;
                                        parent.formData = data.items[iChart];
                                        get();
                                    }
                                " />
                            {{ s.site }}
                        </div>
                    </div>

                    <div class="w70" id="chartOuter">
                    </div>
                </div>
            </popup>
            
            <popup ref="new" :title="(parent.formData && parent.formData.id) ? 'Edit campaign' : 'New campaign'">
                <div class="form inner-form"> 
                    <form @submit.prevent="action()" v-if="parent.formData"> 
                        <div class="rows"> 
                            <label class="custom-label">Name</label> 
                            <input type="text" v-model="parent.formData.title" required> 
                        </div> 
                        <div class="rows"> 
                            <button class="btn" v-if="parent.formData && parent.formData.id">Edit</button> 
                            <button class="btn" v-else>Add</button> 
                        </div> 
                    </form> 
                </div> 
            </popup>

            <div class="table" v-if="data.items != ''"> 
            <div class="t-f">    
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
                        <tr v-for="(item, i) in data.items" :key="item.id">
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
                                    <template v-else>0</template>
                                </a> 
                            </td>
                            <td class="id"> 
                                <a href="#" @click.prevent="$refs.details.active = 1; getDetails(item.id, 3)"> 
                                    <template v-if="item.leads">{{ item.leads }}</template> 
                                    <template v-else>0</template>
                                </a> 
                            </td> 
                            <td class="id"> 
                                <a href="#" @click.prevent="$refs.details.active = 1; getDetails(item.id, 4)"> 
                                    <template v-if="item.fclicks">{{ item.fclicks }}</template> 
                                    <template v-else>0</template>
                                </a> 
                            </td> 
                            <td class="actions">
                                <router-link :to="'/campaign/'+item.id"> 
                                    <i class="fas fa-edit"></i> 
                                </router-link> 
                                <a href="#" 
                                   @click.prevent="
                                     parent.formData = item;
                                     iChart = i;
                                     $refs.chart.active=1;
                                     line(item)
                                   ">
                                    <i class="fas fa-chart-bar"></i> 
                                </a> 
                                <a href="#" @click.prevent="parent.formData = item; del();"> 
                                    <i class="fas fa-trash-alt"></i> 
                                </a> 
                            </td> 
                        </tr> 
                    </tbody> 
                </table>
                </div> 
            </div> 
            <div class="empty" v-else> 
                No items 
            </div> 
        </div> 
    </div>
    `,
};
