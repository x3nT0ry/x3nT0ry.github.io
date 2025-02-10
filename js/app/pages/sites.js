export const sites = { 
    data: function() { 
      return { 
        parent: "", 
        data: {}, 
        date: "", 
        date2: "", 
        loader: 1 
      }
    }, 
    mounted: function(){ 
      this.parent = this.$parent.$parent; 
      if (!this.parent.user) { 
        this.parent.logout(); 
      } 
      this.get(); 
      this.GetFirstAndLastDate(); 
    }, 
    methods: { 
      GetFirstAndLastDate: function(){ 
        var year = new Date().getFullYear(); 
        var month = new Date().getMonth(); 
        var firstDayOfMonth = new Date(year, month, 2); 
        var lastDayOfMonth = new Date(year, month + 1, 1); 
        this.date = firstDayOfMonth.toISOString().substring(0, 10); 
        this.date2 = lastDayOfMonth.toISOString().substring(0, 10); 
      }, 
      get: function() { 
        var self = this; 
        var data = self.parent.toFormData(self.parent.formData);
        data.append('uid', this.parent.user.id); 
        if (this.date != "") data.append('date', this.date); 
        if (this.date2 != "") data.append('date2', this.date2); 
        self.loader = 1; 
        axios.post(this.parent.url + "/site/getSites?auth=" + this.parent.user.auth, data)
        .then(function(response) { 
          self.loader = 0; 
          self.data = response.data; 
        })
        .catch(function(error) { 
          self.parent.logout(); 
        }); 
      },
      action: function(){ 
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);
        axios.post(this.parent.url + "/site/actionSite?auth=" + this.parent.user.auth, data)
        .then(function(response){ 
          if(self.parent.formData.id){ 
            self.$refs.header.$refs.msg.successFun("Successfully updated site!"); 
          } else { 
            self.$refs.header.$refs.msg.successFun("Successfully added new site!"); 
          } 
          self.get(); 
        })
        .catch(function(error) { 
          console.log('errors: ', error); 
        }); 
      }
    },
    template: `
      <div class="inside-content"> 
        <Header ref="header" /> 
        <div id="spinner" v-if="loader"></div> 
        <div class="wrapper"> 
          <div class="flex panel"> 
            <div class="w20 a1 ptb19"> 
              <h1>Sites</h1> 
            </div> 
            <div class="w60 ptb2O ac"> 
              <input type="date" v-model="date" @change="get()" />
              <span style="font-size: 17px; font-weight: bold;"> - </span> 
              <input type="date" v-model="date2" @change="get()" /> 
            </div> 
            <div class="w20 ar ptb20"></div> 
          </div>
  
          <popup ref="copy" title="Copy banner"> 
            <div class="form inner-form"> 
              <form v-if="parent.formData"> 
                <div class="rows">
                  <label class="custom-label">Code</label>
                  <textarea v-model="parent.formData.copy"></textarea> 
                </div> 
                <div class="rows"> 
                  <button class="btn" @click.prevent="copy(parent.formData.copy)">Copy code</button> 
                </div> 
              </form> 
            </div> 
          </popup> 
  
          <div class="table" v-if="data.items != ''"> 
          <div class="t-s">
            <table> 
              <thead> 
                <tr> 
                  <th class="id"></th> 
                  <th class="images">Site</th> 
                  <th class="id">Views</th> 
                  <th class="id">Clicks</th> 
                  <th class="id">Leads</th> 
                  <th class="id">Fraud clicks</th> 
                </tr> 
              </thead> 
              <tbody> 
                <tr v-for="item in data.items"> 
                  <td class="id">
                    <toogle v-model="item.published"
                            @update:modelValue="item.published = $event; parent.formData = item; action();" />
                  </td>
                  <td class="image"> 
                    {{ item.site }} 
                  </td> 
                  <td class="id"> 
                    {{ item.views }}
                  </td> 
                  <td class="id"> 
                    <template v-if="item.clicks">{{ item.clicks }}</template> 
                    <template v-else>0</template> 
                  </td> 
                  <td class="id"> 
                    <template v-if="item.leads">{{ item.leads }}</template> 
                    <template v-else>0</template> 
                  </td> 
                  <td class="id"> 
                    <template v-if="item.fclicks">{{ item.fclicks }}</template> 
                    <template v-else>0</template> 
                  </td> 
                </tr> 
              </tbody> 
            </table> 
          </div> 
          </div> 
          <div class="empty" v-if="data.items == ''"> 
            No items 
          </div> 
        </div> 
      </div> 
    `
  };