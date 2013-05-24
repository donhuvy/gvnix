/*
 * gvNIX. Spring Roo based RAD tool for Generalitat Valenciana Copyright (C)
 * 2013 Generalitat Valenciana
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/copyleft/gpl.html>.
 */
package org.gvnix.addon.datatables;

import java.beans.Introspector;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.gvnix.addon.jpa.query.JpaQueryMetadata;
import org.gvnix.addon.web.mvc.batch.WebJpaBatchMetadata;
import org.osgi.service.component.ComponentContext;
import org.springframework.roo.addon.finder.DynamicFinderServices;
import org.springframework.roo.addon.finder.FinderMetadata;
import org.springframework.roo.addon.finder.QueryHolder;
import org.springframework.roo.addon.jpa.activerecord.JpaActiveRecordMetadata;
import org.springframework.roo.addon.web.mvc.controller.details.DateTimeFormatDetails;
import org.springframework.roo.addon.web.mvc.controller.details.FinderMetadataDetails;
import org.springframework.roo.addon.web.mvc.controller.details.WebMetadataService;
import org.springframework.roo.addon.web.mvc.controller.details.WebMetadataServiceImpl;
import org.springframework.roo.addon.web.mvc.controller.finder.WebFinderMetadata;
import org.springframework.roo.addon.web.mvc.controller.scaffold.WebScaffoldAnnotationValues;
import org.springframework.roo.addon.web.mvc.controller.scaffold.WebScaffoldMetadata;
import org.springframework.roo.classpath.PhysicalTypeIdentifier;
import org.springframework.roo.classpath.PhysicalTypeMetadata;
import org.springframework.roo.classpath.details.BeanInfoUtils;
import org.springframework.roo.classpath.details.FieldMetadata;
import org.springframework.roo.classpath.details.FieldMetadataBuilder;
import org.springframework.roo.classpath.details.MethodMetadata;
import org.springframework.roo.classpath.details.annotations.AnnotatedJavaType;
import org.springframework.roo.classpath.itd.AbstractItdMetadataProvider;
import org.springframework.roo.classpath.itd.ItdTypeDetailsProvidingMetadataItem;
import org.springframework.roo.classpath.scanner.MemberDetails;
import org.springframework.roo.model.JavaSymbolName;
import org.springframework.roo.model.JavaType;
import org.springframework.roo.project.LogicalPath;

/**
 * Provides {@link DatatablesMetadata}.
 * 
 * @author gvNIX Team
 * @since 1.1
 */
@Component
@Service
public final class DatatablesMetadataProvider extends
        AbstractItdMetadataProvider {

    @Reference private WebMetadataService webMetadataService;

    @Reference private DynamicFinderServices dynamicFinderServices;

    /**
     * Register itself into metadataDependencyRegister and add metadata trigger
     * 
     * @param context the component context
     */
    protected void activate(ComponentContext context) {
        metadataDependencyRegistry.registerDependency(
                PhysicalTypeIdentifier.getMetadataIdentiferType(),
                getProvidesType());
        addMetadataTrigger(new JavaType(GvNIXDatatables.class.getName()));
    }

    /**
     * Unregister this provider
     * 
     * @param context the component context
     */
    protected void deactivate(ComponentContext context) {
        metadataDependencyRegistry.deregisterDependency(
                PhysicalTypeIdentifier.getMetadataIdentiferType(),
                getProvidesType());
        removeMetadataTrigger(new JavaType(GvNIXDatatables.class.getName()));
    }

    /**
     * Return an instance of the Metadata offered by this add-on
     */
    protected ItdTypeDetailsProvidingMetadataItem getMetadata(
            String metadataIdentificationString, JavaType aspectName,
            PhysicalTypeMetadata governorPhysicalTypeMetadata,
            String itdFilename) {

        JavaType javaType = DatatablesMetadata
                .getJavaType(metadataIdentificationString);
        LogicalPath path = DatatablesMetadata
                .getPath(metadataIdentificationString);

        final DatatablesAnnotationValues annotationValues = new DatatablesAnnotationValues(
                governorPhysicalTypeMetadata);

        // Get webScaffoldMetadata
        String webScaffoldMetadataId = WebScaffoldMetadata.createIdentifier(
                javaType, path);
        WebScaffoldMetadata webScaffoldMetadata = (WebScaffoldMetadata) metadataService
                .get(webScaffoldMetadataId);

        JavaType webScaffoldAspectName = webScaffoldMetadata.getAspectName();

        WebScaffoldAnnotationValues webScaffoldAnnotationValues = webScaffoldMetadata
                .getAnnotationValues();
        // Get formBackingObject
        JavaType entity = webScaffoldAnnotationValues.getFormBackingObject();

        // Get batch service (if any)
        String webJpaBatchMetadataId = WebJpaBatchMetadata.createIdentifier(
                javaType, path);
        WebJpaBatchMetadata webJpaBatchMetadata = (WebJpaBatchMetadata) metadataService
                .get(webJpaBatchMetadataId);

        // Get jpa query metadata
        String jpaQueryMetadataId = JpaQueryMetadata.createIdentifier(entity,
                path);
        JpaQueryMetadata jpaQueryMetadata = (JpaQueryMetadata) metadataService
                .get(jpaQueryMetadataId);

        List<FieldMetadata> identifiers = persistenceMemberLocator
                .getIdentifierFields(entity);

        String JpaMetadataId = JpaActiveRecordMetadata.createIdentifier(entity,
                path);
        JpaActiveRecordMetadata jpaMetadata = (JpaActiveRecordMetadata) metadataService
                .get(JpaMetadataId);

        String plural = jpaMetadata.getPlural();

        JavaSymbolName entityManagerMethodName = jpaMetadata
                .getEntityManagerMethod().getMethodName();

        // check if has metadata types
        final MemberDetails entityMemberDetails = getMemberDetails(entity);

        final Map<JavaSymbolName, DateTimeFormatDetails> datePatterns = webMetadataService
                .getDatePatterns(entity, entityMemberDetails,
                        metadataIdentificationString);

        // Identify if controller is annotated with @RooWebFinders
        Map<FinderMetadataDetails, QueryHolder> findersRegistered = null;
        String webFinderMetadataId = WebFinderMetadata.createIdentifier(
                javaType, path);
        WebFinderMetadata webFinderMetadata = (WebFinderMetadata) metadataService
                .get(webFinderMetadataId);
        if (webFinderMetadata != null) {

            // Locate finders details
            findersRegistered = getFindersRegisterd(entity, path,
                    entityMemberDetails, plural, jpaMetadata.getEntityName());

        }

        return new DatatablesMetadata(metadataIdentificationString, aspectName,
                governorPhysicalTypeMetadata, annotationValues, entity,
                identifiers, plural, entityManagerMethodName, datePatterns,
                webScaffoldAspectName, webJpaBatchMetadata, jpaQueryMetadata,
                webScaffoldAnnotationValues, findersRegistered);
    }

    /**
     * Locates All {@link FinderMetadataDetails} and its related
     * {@link QueryHolder} for every declared dynamic finder <br>
     * <br>
     * <em>Note:</em> This method is similar to
     * {@link WebMetadataServiceImpl#getDynamicFinderMethodsAndFields(JavaType, MemberDetails, String)}
     * but without register dependency (this dependency produces NPE in
     * {@link #getMetadata(String, JavaType, PhysicalTypeMetadata, String)} when
     * it tries to get JPA information)
     * 
     * @param entity
     * @param path
     * @param entityMemberDetails
     * @param plural
     * @param entityName
     * @return
     * @see WebMetadataServiceImpl#getDynamicFinderMethodsAndFields(JavaType,
     *      MemberDetails, String)
     */
    public Map<FinderMetadataDetails, QueryHolder> getFindersRegisterd(
            JavaType entity, LogicalPath path,
            MemberDetails entityMemberDetails, String plural, String entityName) {

        // Get finder metadata
        final String finderMetadataKey = FinderMetadata.createIdentifier(
                entity, path);
        final FinderMetadata finderMetadata = (FinderMetadata) metadataService
                .get(finderMetadataKey);
        if (finderMetadata == null) {
            return null;
        }

        QueryHolder queryHolder;
        FinderMetadataDetails details;

        Map<FinderMetadataDetails, QueryHolder> findersRegistered = new HashMap<FinderMetadataDetails, QueryHolder>();
        // Iterate over
        for (final MethodMetadata method : finderMetadata
                .getAllDynamicFinders()) {
            final List<JavaSymbolName> parameterNames = method
                    .getParameterNames();
            final List<JavaType> parameterTypes = AnnotatedJavaType
                    .convertFromAnnotatedJavaTypes(method.getParameterTypes());
            final List<FieldMetadata> fields = new ArrayList<FieldMetadata>();
            for (int i = 0; i < parameterTypes.size(); i++) {
                JavaSymbolName fieldName = null;
                if (parameterNames.get(i).getSymbolName().startsWith("max")
                        || parameterNames.get(i).getSymbolName()
                                .startsWith("min")) {
                    fieldName = new JavaSymbolName(
                            Introspector.decapitalize(StringUtils
                                    .capitalize(parameterNames.get(i)
                                            .getSymbolName().substring(3))));
                }
                else {
                    fieldName = parameterNames.get(i);
                }
                final FieldMetadata field = BeanInfoUtils
                        .getFieldForPropertyName(entityMemberDetails, fieldName);
                if (field != null) {
                    final FieldMetadataBuilder fieldMd = new FieldMetadataBuilder(
                            field);
                    fieldMd.setFieldName(parameterNames.get(i));
                    fields.add(fieldMd.build());
                }
            }

            details = new FinderMetadataDetails(method.getMethodName()
                    .getSymbolName(), method, fields);

            // locate QueryHolder instances. This objects contain
            // information about a roo finder (parameters names and types
            // and a "token" list with of find definition

            queryHolder = dynamicFinderServices.getQueryHolder(
                    entityMemberDetails, method.getMethodName(), plural,
                    entityName);
            findersRegistered.put(details, queryHolder);

        }
        return findersRegistered;
    }

    /**
     * Define the unique ITD file name extension, here the resulting file name
     * will be **_ROO_GvNIXDatatables.aj
     */
    public String getItdUniquenessFilenameSuffix() {
        return "GvNIXDatatables";
    }

    protected String getGovernorPhysicalTypeIdentifier(
            String metadataIdentificationString) {
        JavaType javaType = DatatablesMetadata
                .getJavaType(metadataIdentificationString);
        LogicalPath path = DatatablesMetadata
                .getPath(metadataIdentificationString);
        return PhysicalTypeIdentifier.createIdentifier(javaType, path);
    }

    protected String createLocalIdentifier(JavaType javaType, LogicalPath path) {
        return DatatablesMetadata.createIdentifier(javaType, path);
    }

    public String getProvidesType() {
        return DatatablesMetadata.getMetadataIdentiferType();
    }
}