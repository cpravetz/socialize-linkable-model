/* eslint-disable import/no-unresolved */
import SimpleSchema from 'meteor/aldeed:simple-schema';
/* eslint-enable import/no-unresolved */

SimpleSchema.extendOptions(["index", "unique", "denyInsert", "denyUpdate"]);

export default () => {
    // a place to store references to the collections where the commentable objects are stored.
    const LinkableTypes = {};

    /**
    * A scaffold for creating models which can link records from one collection to records from many other collections
    * @mixin LinkableModel
    */
    const LinkableModel = Base => class extends Base {
        /**
        * getCollectionForParentLink - Get the collection for the ParentLink
        *
        * @return {Mongo.Collection} The Collection attached to the ParentLink
        */
        getCollectionForParentLink() {
            return LinkableTypes[this.objectType];
        }
        /**
        * linkedObject - Get the model for the linked record
        *
        * @return {Model}  A model of varying types depending on the linked objects type
        */
        linkedParent() {
            const collection = this.getCollectionForParentLink();
            return collection.findOne({ _id: this.linkedObjectId });
        }
    };

    /**
    * Register a data type that can be linked to another model, storing its collection so we can find the object later
    * @param {BaseModel}           type       The name of the type
    * @param {Mongo.Collection} collection The collection where the type of data is stored
    */
    LinkableModel.registerParentModel = function registerParentModel(model) {
        const type = model.prototype.getCollectionName();

        model.prototype._objectType = type; // eslint-disable-line

        LinkableTypes[type] = model.prototype.getCollection();
    };

    LinkableModel.LinkableSchema = new SimpleSchema({
        linkedObjectId: {
            type: String,
            index: 1,
        },
        objectType: {
            type: String,
            denyUpdate: true,
        },
    });

    return LinkableModel;
};
